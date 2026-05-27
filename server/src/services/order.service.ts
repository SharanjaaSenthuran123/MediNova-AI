import {
  DeliveryOrder,
  DeliveryAgent,
  MedicineCatalog,
  type IDeliveryOrder,
} from "../models/Order.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { nearest, type GeoPoint } from "./location.service.js";
import {
  categoryFromOrder,
  priorityScore,
  sortByPriority,
} from "./priority.service.js";
import { emitBroadcast, emitToUser } from "./socket.service.js";
import { syncInventoryFromCatalog } from "./inventory-sync.service.js";
import { estimateDeliveryAt, estimateDeliveryMinutes } from "./eta.service.js";
import { notifyUser } from "./notification.service.js";
import { createOrderInvoice, invoiceNumber } from "./invoice.service.js";

export const DELIVERY_FEE = 2.99;

export async function placeMedicineOrder(input: {
  userId: string;
  items: { medicineId: string; quantity: number }[];
  userLocation: GeoPoint;
  isEmergency?: boolean;
  paymentMethod?: IDeliveryOrder["paymentMethod"];
  deliveryAddress?: string;
  notes?: string;
  prescriptionId?: string;
}) {
  if (!input.items.length) throw new Error("Cart is empty");

  const medicineLines: IDeliveryOrder["items"] = [];
  let subtotal = 0;
  let pharmacyId: string | null = null;
  const decremented: { catalogId: string; quantity: number }[] = [];

  try {
    for (const line of input.items) {
      const med = await MedicineCatalog.findOneAndUpdate(
        { _id: line.medicineId, stock: { $gte: line.quantity } },
        { $inc: { stock: -line.quantity } },
        { new: true }
      );

      if (!med) {
        const existing = await MedicineCatalog.findById(line.medicineId);
        if (!existing) {
          throw new Error(`Medicine not found: ${line.medicineId}`);
        }
        throw new Error(
          `Insufficient stock for ${existing.name} (${existing.stock} available)`
        );
      }

      const medPharmacyId = med.pharmacyId.toString();
      if (pharmacyId && pharmacyId !== medPharmacyId) {
        throw new Error("All items in one order must be from the same pharmacy");
      }
      pharmacyId = medPharmacyId;

      decremented.push({ catalogId: med._id.toString(), quantity: line.quantity });
      await syncInventoryFromCatalog(med._id.toString(), med.stock);

      if (med.stock === 0) {
        emitBroadcast("medicine:out_of_stock", {
          medicineId: med._id.toString(),
          name: med.name,
          pharmacyId: med.pharmacyId.toString(),
        });
      }

      emitBroadcast("pharmacy:stock", {
        inventoryId: med._id.toString(),
        medicineName: med.name,
        stock: med.stock,
        pharmacyId: med.pharmacyId.toString(),
      });

      const lineTotal = med.price * line.quantity;
      subtotal += lineTotal;
      medicineLines.push({
        medicineId: med._id,
        medicineName: med.name,
        quantity: line.quantity,
        unitPrice: med.price,
      });
    }

    if (!pharmacyId) throw new Error("No medicines in order");

    const deliveryFee = DELIVERY_FEE;
    const totalAmount = subtotal + deliveryFee;

    const pharmacies = await Pharmacy.find();
    const nearestPharmacy = nearest(input.userLocation, pharmacies);
    const distanceKm = nearestPharmacy?.distanceKm ?? 5;
    const estimatedMinutes = estimateDeliveryMinutes(distanceKm);
    const estimatedDeliveryAt = estimateDeliveryAt(distanceKm);
    const invNum = invoiceNumber();

    const agents = await DeliveryAgent.find({ isAvailable: true });
    const nearestAgent = nearest(input.userLocation, agents);
    const priorityCategory = categoryFromOrder(Boolean(input.isEmergency));

    const order = await DeliveryOrder.create({
      userId: input.userId,
      pharmacyId,
      deliveryAgentId: nearestAgent?.item._id,
      items: medicineLines,
      subtotal,
      deliveryFee,
      totalAmount,
      status: "pending",
      priorityCategory,
      isEmergency: Boolean(input.isEmergency),
      userLocation: input.userLocation,
      deliveryAddress: input.deliveryAddress,
      paymentMethod: input.paymentMethod ?? "cod",
      paymentStatus: input.paymentMethod === "cod" ? "pending" : "pending",
      distanceKm,
      estimatedMinutes,
      estimatedDeliveryAt,
      invoiceNumber: invNum,
      notes: input.notes,
      prescriptionId: input.prescriptionId,
      returnStatus: "none",
    });

    if (nearestAgent?.item) {
      nearestAgent.item.isAvailable = false;
      nearestAgent.item.activeOrderId = order._id;
      await nearestAgent.item.save();
    }

    emitBroadcast("order:created", {
      orderId: order._id.toString(),
      priority: priorityCategory,
      status: order.status,
      estimatedDeliveryAt: estimatedDeliveryAt.toISOString(),
    });

    await createOrderInvoice(input.userId, order);
    await notifyUser(input.userId, {
      title: "Order placed",
      body: `Order #${order._id.toString().slice(-6)} — $${totalAmount.toFixed(2)}. ETA ~${estimatedMinutes} min`,
      type: "order",
    });

    return order;
  } catch (err) {
    for (const entry of decremented) {
      const restored = await MedicineCatalog.findByIdAndUpdate(
        entry.catalogId,
        { $inc: { stock: entry.quantity } },
        { new: true }
      );
      if (restored) await syncInventoryFromCatalog(entry.catalogId, restored.stock);
    }
    throw err;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: IDeliveryOrder["status"],
  actorUserId?: string
) {
  const order = await DeliveryOrder.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  ).populate("pharmacyId");

  if (!order) throw new Error("Order not found");

  if (status === "delivered" && order.deliveryAgentId) {
    await DeliveryAgent.findByIdAndUpdate(order.deliveryAgentId, {
      isAvailable: true,
      activeOrderId: null,
    });
  }

  if (status === "dispatched" && order.deliveryAgentId) {
    const agent = await DeliveryAgent.findById(order.deliveryAgentId);
    if (agent) {
      order.agentLocation = { lat: agent.lat, lng: agent.lng, updatedAt: new Date() };
      await order.save();
      emitBroadcast("delivery:location", {
        orderId: order._id.toString(),
        lat: agent.lat,
        lng: agent.lng,
      });
    }
  }

  emitBroadcast("order:updated", {
    orderId: order._id.toString(),
    status: order.status,
    estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString(),
  });

  await notifyUser(order.userId.toString(), {
    title: "Order update",
    body: `Your order is now ${status.replace("_", " ")}`,
    type: "order",
  });

  return order;
}

export async function cancelMedicineOrder(orderId: string, userId: string) {
  const order = await DeliveryOrder.findOne({ _id: orderId, userId });
  if (!order) throw new Error("Order not found");
  if (order.status !== "pending") {
    throw new Error("Only pending orders can be cancelled");
  }

  for (const line of order.items) {
    if (!line.medicineId) continue;
    const med = await MedicineCatalog.findByIdAndUpdate(
      line.medicineId,
      { $inc: { stock: line.quantity } },
      { new: true }
    );
    if (med) {
      await syncInventoryFromCatalog(med._id.toString(), med.stock);
      emitBroadcast("pharmacy:stock", {
        inventoryId: med._id.toString(),
        medicineName: med.name,
        stock: med.stock,
        pharmacyId: med.pharmacyId.toString(),
      });
    }
  }

  if (order.deliveryAgentId) {
    await DeliveryAgent.findByIdAndUpdate(order.deliveryAgentId, {
      isAvailable: true,
      activeOrderId: null,
    });
  }

  order.status = "cancelled";
  await order.save();

  emitBroadcast("order:updated", {
    orderId: order._id.toString(),
    status: order.status,
  });
  await notifyUser(userId, {
    title: "Order cancelled",
    body: `Order #${order._id.toString().slice(-6)} was cancelled`,
    type: "order",
  });

  return order;
}

export async function requestOrderReturn(
  orderId: string,
  userId: string,
  reason: string
) {
  const order = await DeliveryOrder.findOne({ _id: orderId, userId });
  if (!order) throw new Error("Order not found");
  if (order.status !== "delivered") {
    throw new Error("Returns are only available for delivered orders");
  }
  if (order.returnStatus && order.returnStatus !== "none" && order.returnStatus !== "rejected") {
    throw new Error("Return already requested for this order");
  }

  const { ReturnRequest } = await import("../models/PharmacyExtras.js");
  await ReturnRequest.create({
    userId,
    orderId: order._id,
    reason,
    items: order.items.map((item) => ({
      medicineName: item.medicineName,
      quantity: item.quantity,
    })),
    status: "requested",
  });

  order.returnStatus = "requested";
  await order.save();

  await notifyUser(userId, {
    title: "Return requested",
    body: `Return request submitted for order #${order._id.toString().slice(-6)}`,
    type: "order",
  });

  return order;
}

export async function getPriorityQueue() {
  const [bloodModule, orders] = await Promise.all([
    import("../models/BloodBank.js"),
    DeliveryOrder.find({
      status: { $in: ["pending", "confirmed", "packed", "dispatched"] },
    }).limit(100),
  ]);

  const bloodRequests = await bloodModule.BloodRequest.find({
    status: { $in: ["pending", "accepted", "matched"] },
  }).limit(100);

  const queue = [
    ...bloodRequests.map((r) => ({
      type: "blood" as const,
      id: r._id.toString(),
      priorityCategory: "emergency_blood" as const,
      createdAt: (r as { createdAt: Date }).createdAt,
      urgencyBoost: r.urgency === "critical" ? 500 : r.urgency === "urgent" ? 200 : 0,
      summary: `${r.bloodGroup} — ${r.hospital}`,
    })),
    ...orders.map((o) => ({
      type: "order" as const,
      id: o._id.toString(),
      priorityCategory: o.priorityCategory,
      createdAt: (o as { createdAt: Date }).createdAt,
      urgencyBoost: o.isEmergency ? 100 : 0,
      summary: `Medicine order $${o.totalAmount.toFixed(2)}`,
    })),
  ];

  return sortByPriority(queue);
}

export { priorityScore };
