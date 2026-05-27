import mongoose, { Schema, type Document, type Types } from "mongoose";

export type PaymentProvider = "stripe" | "payhere" | "paypal";
export type PaymentPurpose =
  | "appointment"
  | "medicine"
  | "subscription"
  | "donation";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  purpose: PaymentPurpose;
  referenceId?: string;
  externalId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  metadata?: Record<string, unknown>;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    provider: { type: String, enum: ["stripe", "payhere", "paypal"], required: true },
    purpose: {
      type: String,
      enum: ["appointment", "medicine", "subscription", "donation"],
      required: true,
    },
    referenceId: String,
    externalId: String,
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  plan: "basic" | "premium" | "enterprise";
  provider: PaymentProvider;
  externalId?: string;
  status: "active" | "cancelled" | "expired" | "past_due";
  currentPeriodEnd?: Date;
  amount: number;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, enum: ["basic", "premium", "enterprise"], required: true },
    provider: { type: String, enum: ["stripe", "payhere", "paypal"], required: true },
    externalId: String,
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "past_due"],
      default: "active",
    },
    currentPeriodEnd: Date,
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);

export interface IInvoice extends Document {
  userId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  currency: string;
  description?: string;
  lineItems?: { description: string; quantity: number; unitPrice: number }[];
  status: "draft" | "sent" | "paid" | "void";
  pdfUrl?: string;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    orderId: { type: Schema.Types.ObjectId, ref: "DeliveryOrder", index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    description: String,
    lineItems: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "void"],
      default: "sent",
    },
    pdfUrl: String,
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);
