import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IPharmacy extends Document {
  name: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  lat: number;
  lng: number;
  is24Hours: boolean;
  isEmergency: boolean;
  rating: number;
  openHours: string;
}

const pharmacySchema = new Schema<IPharmacy>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    is24Hours: { type: Boolean, default: false },
    isEmergency: { type: Boolean, default: false },
    rating: { type: Number, default: 4.5 },
    openHours: { type: String, default: "8:00 AM - 10:00 PM" },
  },
  { timestamps: true }
);

export const Pharmacy = mongoose.model<IPharmacy>("Pharmacy", pharmacySchema);

export interface IPharmacyInventory extends Document {
  pharmacyId: Types.ObjectId;
  medicineName: string;
  genericName?: string;
  stock: number;
  price: number;
  unit: string;
  expiryDate: string;
  requiresPrescription: boolean;
  category: string;
}

const inventorySchema = new Schema<IPharmacyInventory>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    medicineName: { type: String, required: true, index: true },
    genericName: String,
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    unit: { type: String, default: "tablet" },
    expiryDate: { type: String, required: true },
    requiresPrescription: { type: Boolean, default: false },
    category: { type: String, default: "general" },
  },
  { timestamps: true }
);

inventorySchema.index({ pharmacyId: 1, medicineName: 1 });

export const PharmacyInventory = mongoose.model<IPharmacyInventory>(
  "PharmacyInventory",
  inventorySchema
);

export interface IMedicineOrder extends Document {
  userId: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  items: { medicineName: string; quantity: number; price: number }[];
  totalAmount: number;
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  prescriptionUrl?: string;
}

const orderSchema = new Schema<IMedicineOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    items: [{ medicineName: String, quantity: Number, price: Number }],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "ready", "completed", "cancelled"],
      default: "pending",
    },
    prescriptionUrl: String,
  },
  { timestamps: true }
);

export const MedicineOrder = mongoose.model<IMedicineOrder>(
  "MedicineOrder",
  orderSchema
);
