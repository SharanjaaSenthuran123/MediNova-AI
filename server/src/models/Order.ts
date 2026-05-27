import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { PriorityCategory } from "../services/priority.service.js";
import type { Timestamps } from "../types/timestamps.js";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "card" | "bank_transfer" | "stripe" | "payhere" | "paypal" | "cod";

export interface IOrderItem {
  medicineId?: Types.ObjectId;
  medicineName: string;
  quantity: number;
  unitPrice: number;
}

export interface IDeliveryOrder extends Document, Timestamps {
  userId: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  deliveryAgentId?: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  priorityCategory: PriorityCategory;
  isEmergency: boolean;
  userLocation: { lat: number; lng: number };
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  distanceKm?: number;
  notes?: string;
  estimatedDeliveryAt?: Date;
  estimatedMinutes?: number;
  returnStatus?: "none" | "requested" | "approved" | "rejected" | "refunded";
  invoiceNumber?: string;
  prescriptionId?: Types.ObjectId;
  agentLocation?: { lat: number; lng: number; updatedAt?: Date };
}

const orderSchema = new Schema<IDeliveryOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    deliveryAgentId: { type: Schema.Types.ObjectId, ref: "DeliveryAgent" },
    items: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: "MedicineCatalog" },
        medicineName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "dispatched", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    priorityCategory: {
      type: String,
      enum: ["emergency_blood", "emergency_medicine", "normal_medicine"],
      default: "normal_medicine",
      index: true,
    },
    isEmergency: { type: Boolean, default: false },
    userLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    deliveryAddress: String,
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "stripe", "payhere", "paypal", "cod"],
      default: "card",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    distanceKm: Number,
    notes: String,
    estimatedDeliveryAt: Date,
    estimatedMinutes: Number,
    returnStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected", "refunded"],
      default: "none",
    },
    invoiceNumber: String,
    prescriptionId: { type: Schema.Types.ObjectId, ref: "Prescription" },
    agentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

orderSchema.index({ priorityCategory: 1, status: 1, createdAt: 1 });

export const DeliveryOrder = mongoose.model<IDeliveryOrder>(
  "DeliveryOrder",
  orderSchema
);

export interface IDeliveryAgent extends Document {
  name: string;
  phone: string;
  email?: string;
  lat: number;
  lng: number;
  isAvailable: boolean;
  vehicleType: string;
  activeOrderId?: Types.ObjectId;
}

const agentSchema = new Schema<IDeliveryAgent>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true, index: true },
    vehicleType: { type: String, default: "motorcycle" },
    activeOrderId: { type: Schema.Types.ObjectId, ref: "DeliveryOrder" },
  },
  { timestamps: true }
);

export const DeliveryAgent = mongoose.model<IDeliveryAgent>(
  "DeliveryAgent",
  agentSchema
);

/** Unified medicine catalog (production inventory source). */
export interface IMedicineCatalog extends Document {
  name: string;
  genericName?: string;
  price: number;
  category: string;
  stock: number;
  expiryDate: string;
  pharmacyId: Types.ObjectId;
  description?: string;
  dosageInfo?: string;
  barcode?: string;
  requiresPrescription: boolean;
}

const catalogSchema = new Schema<IMedicineCatalog>(
  {
    name: { type: String, required: true, index: true },
    genericName: String,
    price: { type: Number, required: true },
    category: { type: String, default: "general", index: true },
    stock: { type: Number, default: 0, index: true },
    expiryDate: { type: String, required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    description: String,
    dosageInfo: String,
    barcode: { type: String, sparse: true },
    requiresPrescription: { type: Boolean, default: false },
  },
  { timestamps: true }
);

catalogSchema.index({ pharmacyId: 1, name: 1 });

export const MedicineCatalog = mongoose.model<IMedicineCatalog>(
  "MedicineCatalog",
  catalogSchema
);
