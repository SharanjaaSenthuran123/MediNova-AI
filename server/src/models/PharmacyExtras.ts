import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IWishlistItem extends Document {
  userId: Types.ObjectId;
  medicineId: Types.ObjectId;
  medicineName: string;
  price: number;
  pharmacyId?: Types.ObjectId;
  pharmacyName?: string;
}

const wishlistSchema = new Schema<IWishlistItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicineId: { type: Schema.Types.ObjectId, ref: "MedicineCatalog", required: true },
    medicineName: { type: String, required: true },
    price: { type: Number, required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy" },
    pharmacyName: String,
  },
  { timestamps: true }
);

wishlistSchema.index({ userId: 1, medicineId: 1 }, { unique: true });

export const Wishlist = mongoose.model<IWishlistItem>("Wishlist", wishlistSchema);

export interface IRecentlyViewed extends Document {
  userId: Types.ObjectId;
  medicineId: Types.ObjectId;
  medicineName: string;
  price: number;
  category?: string;
  pharmacyName?: string;
  viewedAt: Date;
}

const recentlyViewedSchema = new Schema<IRecentlyViewed>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicineId: { type: Schema.Types.ObjectId, ref: "MedicineCatalog", required: true },
    medicineName: { type: String, required: true },
    price: { type: Number, required: true },
    category: String,
    pharmacyName: String,
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

recentlyViewedSchema.index({ userId: 1, medicineId: 1 }, { unique: true });

export const RecentlyViewed = mongoose.model<IRecentlyViewed>(
  "RecentlyViewed",
  recentlyViewedSchema
);

export type AddressLabel = "home" | "work" | "other";

export interface ISavedAddress extends Document {
  userId: Types.ObjectId;
  label: AddressLabel;
  customLabel?: string;
  address: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

const savedAddressSchema = new Schema<ISavedAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, enum: ["home", "work", "other"], default: "home" },
    customLabel: String,
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SavedAddress = mongoose.model<ISavedAddress>(
  "SavedAddress",
  savedAddressSchema
);

export type ReturnStatus = "none" | "requested" | "approved" | "rejected" | "refunded";

export interface IReturnRequest extends Document {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  reason: string;
  items: { medicineName: string; quantity: number }[];
  status: ReturnStatus;
  adminNotes?: string;
}

const returnRequestSchema = new Schema<IReturnRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "DeliveryOrder", required: true, index: true },
    reason: { type: String, required: true },
    items: [
      {
        medicineName: String,
        quantity: Number,
      },
    ],
    status: {
      type: String,
      enum: ["none", "requested", "approved", "rejected", "refunded"],
      default: "requested",
    },
    adminNotes: String,
  },
  { timestamps: true }
);

export const ReturnRequest = mongoose.model<IReturnRequest>(
  "ReturnRequest",
  returnRequestSchema
);
