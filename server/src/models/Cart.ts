import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ICartLine {
  medicineId: Types.ObjectId;
  medicineName: string;
  price: number;
  quantity: number;
  unit: string;
  maxStock: number;
  pharmacyId?: Types.ObjectId;
  pharmacyName?: string;
  requiresPrescription?: boolean;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  pharmacyId?: Types.ObjectId;
  items: ICartLine[];
}

const cartLineSchema = new Schema<ICartLine>(
  {
    medicineId: { type: Schema.Types.ObjectId, ref: "MedicineCatalog", required: true },
    medicineName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: "tablet" },
    maxStock: { type: Number, required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy" },
    pharmacyName: String,
    requiresPrescription: { type: Boolean, default: false },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy" },
    items: { type: [cartLineSchema], default: [] },
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>("Cart", cartSchema);
