import type { IDeliveryOrder } from "../models/Order.js";
import type { IPharmacy } from "../models/Pharmacy.js";
import type { IDeliveryAgent } from "../models/Order.js";

type PopulatedPharmacy = IPharmacy | { _id: unknown; name?: string };
type PopulatedAgent = IDeliveryAgent | { _id: unknown; name?: string; phone?: string };

function pharmacyDto(pharmacy: PopulatedPharmacy | null | undefined) {
  if (!pharmacy || typeof pharmacy !== "object" || !("name" in pharmacy)) return null;
  return {
    _id: String((pharmacy as IPharmacy)._id),
    name: pharmacy.name,
    address: (pharmacy as IPharmacy).address,
    city: (pharmacy as IPharmacy).city,
    phone: (pharmacy as IPharmacy).phone,
    lat: (pharmacy as IPharmacy).lat,
    lng: (pharmacy as IPharmacy).lng,
  };
}

function agentDto(agent: PopulatedAgent | null | undefined) {
  if (!agent || typeof agent !== "object" || !("name" in agent)) return null;
  return {
    _id: String((agent as IDeliveryAgent)._id),
    name: agent.name,
    phone: (agent as IDeliveryAgent).phone,
    vehicleType: (agent as IDeliveryAgent).vehicleType,
  };
}

export function toOrderDto(order: IDeliveryOrder & { createdAt?: Date; updatedAt?: Date }) {
  const pharmacy = order.pharmacyId as unknown as PopulatedPharmacy;
  const agent = order.deliveryAgentId as unknown as PopulatedAgent;

  return {
    _id: order._id.toString(),
    items: order.items.map((item) => ({
      medicineId: item.medicineId?.toString(),
      medicineName: item.medicineName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
    })),
    totalAmount: order.totalAmount,
    subtotal: order.subtotal ?? order.totalAmount,
    deliveryFee: order.deliveryFee ?? 0,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    priorityCategory: order.priorityCategory,
    isEmergency: order.isEmergency,
    deliveryAddress: order.deliveryAddress,
    userLocation: order.userLocation,
    distanceKm: order.distanceKm,
    notes: order.notes,
    estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString(),
    estimatedMinutes: order.estimatedMinutes,
    returnStatus: order.returnStatus ?? "none",
    invoiceNumber: order.invoiceNumber,
    agentLocation: order.agentLocation
      ? {
          lat: order.agentLocation.lat,
          lng: order.agentLocation.lng,
          updatedAt: order.agentLocation.updatedAt?.toISOString(),
        }
      : null,
    pharmacyId: pharmacyDto(pharmacy),
    deliveryAgent: agentDto(agent),
    createdAt: (order.createdAt ?? new Date()).toISOString(),
    updatedAt: (order.updatedAt ?? new Date()).toISOString(),
  };
}
