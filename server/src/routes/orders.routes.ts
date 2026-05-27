import { Router } from "express";
import { z } from "zod";
import { MedicineCatalog } from "../models/Order.js";
import { DeliveryOrder, DeliveryAgent } from "../models/Order.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { placeMedicineOrder, updateOrderStatus, getPriorityQueue, cancelMedicineOrder, requestOrderReturn } from "../services/order.service.js";
import { toOrderDto } from "../utils/order-dto.js";
import { routeParam } from "../utils/routeParam.js";
import { buildInvoiceHtml } from "../services/invoice.service.js";
import { User } from "../models/User.js";
import { expandMedicineSearchTerms } from "../data/pharmacy-catalog.js";
import { nearest } from "../services/location.service.js";
import { Pharmacy } from "../models/Pharmacy.js";

const router = Router();

function buildMedicineFilter(query: string) {
  const q = query.trim();
  if (!q) return {};
  const terms = expandMedicineSearchTerms(q);
  const patterns = terms.length > 0 ? terms : [q];
  return {
    $or: patterns.flatMap((term) => [
      { name: { $regex: term, $options: "i" } },
      { genericName: { $regex: term, $options: "i" } },
    ]),
  };
}

router.get(
  "/medicines",
  asyncHandler(async (req, res) => {
    const { category, inStock, q } = req.query;
    const filter: Record<string, unknown> = {};

    if (q) Object.assign(filter, buildMedicineFilter(String(q)));
    if (category) filter.category = category;
    if (inStock === "true") filter.stock = { $gt: 0 };

    const medicines = await MedicineCatalog.find(filter)
      .populate("pharmacyId")
      .sort({ name: 1 })
      .limit(100);

    return res.json({
      medicines: medicines.map((m) => ({
        id: m._id.toString(),
        catalogId: m._id.toString(),
        name: m.name,
        genericName: m.genericName,
        price: m.price,
        category: m.category,
        stock: m.stock,
        inStock: m.stock > 0,
        expiryDate: m.expiryDate,
        description: m.description,
        dosageInfo: m.dosageInfo,
        requiresPrescription: m.requiresPrescription,
        pharmacy:
          m.pharmacyId && typeof m.pharmacyId === "object" && "name" in m.pharmacyId
            ? {
                id: (m.pharmacyId as { _id: { toString(): string } })._id.toString(),
                name: (m.pharmacyId as { name: string }).name,
                lat: (m.pharmacyId as unknown as { lat: number }).lat,
                lng: (m.pharmacyId as unknown as { lng: number }).lng,
              }
            : null,
      })),
    });
  })
);

const orderCreateSchema = z.object({
  items: z.array(
    z.object({
      medicineId: z.string(),
      quantity: z.coerce.number().min(1),
    })
  ),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  isEmergency: z.boolean().optional(),
  paymentMethod: z
    .enum(["card", "bank_transfer", "stripe", "payhere", "paypal", "cod"])
    .optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  prescriptionId: z.string().optional(),
});

async function handleCreateOrder(req: AuthRequest, res: import("express").Response) {
  const parsed = orderCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid order payload" });

  try {
    const order = await placeMedicineOrder({
      userId: req.user!._id.toString(),
      items: parsed.data.items,
      userLocation: { lat: parsed.data.lat, lng: parsed.data.lng },
      isEmergency: parsed.data.isEmergency,
      paymentMethod: parsed.data.paymentMethod,
      deliveryAddress: parsed.data.deliveryAddress,
      notes: parsed.data.notes,
      prescriptionId: parsed.data.prescriptionId,
    });

    return res.status(201).json({ order: toOrderDto(order) });
  } catch (err) {
    return res.status(400).json({
      error: err instanceof Error ? err.message : "Order failed",
    });
  }
}

router.post(
  "/medicines/orders",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => handleCreateOrder(req, res))
);

router.post(
  "/create",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => handleCreateOrder(req, res))
);

router.get(
  "/medicines/orders/mine",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const orders = await DeliveryOrder.find({ userId: req.user!._id })
      .populate("pharmacyId")
      .populate("deliveryAgentId")
      .sort({ createdAt: -1 });

    return res.json({ orders: orders.map(toOrderDto) });
  })
);

router.get(
  "/medicines/orders/:id",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await DeliveryOrder.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    })
      .populate("pharmacyId")
      .populate("deliveryAgentId");

    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json({ order: toOrderDto(order) });
  })
);

router.post(
  "/medicines/orders/:id/return",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({ reason: z.string().min(5) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Reason required (min 5 chars)" });

    try {
      const order = await requestOrderReturn(
        routeParam(req.params.id),
        req.user!._id.toString(),
        parsed.data.reason
      );
      const populated = await DeliveryOrder.findById(order._id)
        .populate("pharmacyId")
        .populate("deliveryAgentId");
      return res.json({ order: toOrderDto(populated!) });
    } catch (err) {
      return res.status(400).json({
        error: err instanceof Error ? err.message : "Return request failed",
      });
    }
  })
);

router.get(
  "/medicines/orders/:id/invoice",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await DeliveryOrder.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const user = await User.findById(req.user!._id);
    const html = buildInvoiceHtml(
      order,
      order.invoiceNumber ?? `INV-${order._id.toString().slice(-6)}`,
      user?.name ?? "Customer"
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  })
);

router.get(
  "/medicines/orders/:id/tracking",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await DeliveryOrder.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    })
      .populate("pharmacyId")
      .populate("deliveryAgentId");

    if (!order) return res.status(404).json({ error: "Order not found" });

    const agent = order.deliveryAgentId as unknown as {
      lat?: number;
      lng?: number;
    } | null;

    return res.json({
      order: toOrderDto(order),
      tracking: {
        agentLocation:
          order.agentLocation ??
          (agent?.lat != null ? { lat: agent.lat, lng: agent.lng! } : null),
        estimatedDeliveryAt: order.estimatedDeliveryAt,
        estimatedMinutes: order.estimatedMinutes,
      },
    });
  })
);

router.post(
  "/medicines/orders/:id/cancel",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const order = await cancelMedicineOrder(
        routeParam(req.params.id),
        req.user!._id.toString()
      );
      const populated = await DeliveryOrder.findById(order._id)
        .populate("pharmacyId")
        .populate("deliveryAgentId");
      return res.json({ order: toOrderDto(populated!) });
    } catch (err) {
      return res.status(400).json({
        error: err instanceof Error ? err.message : "Cancel failed",
      });
    }
  })
);

router.patch(
  "/medicines/orders/:id/status",
  requireAuth,
  requireRole("admin", "pharmacy", "doctor"),
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      status: z.enum(["pending", "confirmed", "packed", "dispatched", "delivered", "cancelled"]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid status" });

    try {
      const order = await updateOrderStatus(
        routeParam(req.params.id),
        parsed.data.status,
        req.user!._id.toString()
      );
      return res.json({ order: toOrderDto(order) });
    } catch (err) {
      return res.status(404).json({
        error: err instanceof Error ? err.message : "Update failed",
      });
    }
  })
);

router.post(
  "/location/nearest-pharmacy",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({ lat: z.number(), lng: z.number() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid coordinates" });

    const pharmacies = await Pharmacy.find();
    const match = nearest(parsed.data, pharmacies);
    return res.json({ pharmacy: match?.item ?? null, distanceKm: match?.distanceKm });
  })
);

router.get(
  "/priority-queue",
  requireAuth,
  requireRole("admin", "doctor", "pharmacy"),
  asyncHandler(async (_req, res) => {
    const queue = await getPriorityQueue();
    return res.json({ queue });
  })
);

router.get(
  "/delivery-agents",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const agents = await DeliveryAgent.find().sort({ isAvailable: -1 });
    return res.json({ agents });
  })
);

router.get(
  "/history",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const orders = await DeliveryOrder.find({ userId: req.user!._id })
      .populate("pharmacyId")
      .populate("deliveryAgentId")
      .sort({ createdAt: -1 });
    return res.json({ orders: orders.map(toOrderDto) });
  })
);

export default router;
