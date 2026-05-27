export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  | "card"
  | "bank_transfer"
  | "stripe"
  | "payhere"
  | "paypal"
  | "cod";

export interface Pharmacy {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  is24Hours: boolean;
  isEmergency: boolean;
  rating: number;
  openHours: string;
  distanceKm?: number;
  availableMedicines?: number;
  topMedicines?: { id: string; name: string; stock: number; price: number }[];
}

export interface PharmacySearchResult {
  id: string;
  catalogId?: string;
  medicineName: string;
  genericName?: string;
  stock: number;
  price: number;
  unit: string;
  expiryDate: string;
  requiresPrescription: boolean;
  category: string;
  pharmacy: Pharmacy | null;
  pharmacyId?: string;
  inStock: boolean;
}

export interface CartItem {
  medicineId: string;
  medicineName: string;
  price: number;
  quantity: number;
  unit: string;
  maxStock: number;
  pharmacyId?: string;
  pharmacyName?: string;
  requiresPrescription?: boolean;
}

export interface OrderLineItem {
  medicineId?: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface DeliveryAgentSummary {
  _id: string;
  name: string;
  phone: string;
  vehicleType: string;
}

export interface DeliveryOrder {
  _id: string;
  items: OrderLineItem[];
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: PaymentMethod;
  priorityCategory?: string;
  isEmergency: boolean;
  deliveryAddress?: string;
  userLocation: { lat: number; lng: number };
  distanceKm?: number;
  notes?: string;
  estimatedDeliveryAt?: string;
  estimatedMinutes?: number;
  returnStatus?: "none" | "requested" | "approved" | "rejected" | "refunded";
  invoiceNumber?: string;
  agentLocation?: { lat: number; lng: number; updatedAt?: string } | null;
  pharmacyId: Pharmacy | null;
  deliveryAgent?: DeliveryAgentSummary | null;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated use DeliveryOrder */
export type MedicineOrder = DeliveryOrder;

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "dispatched",
  "delivered",
];

export function orderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: "Order placed",
    confirmed: "Confirmed",
    packed: "Packed",
    dispatched: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status];
}
