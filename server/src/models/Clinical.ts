import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { Timestamps } from "../types/timestamps.js";

export interface IMedicine extends Document {
  barcode: string;
  name: string;
  genericName?: string;
  dosage: string;
  manufacturer: string;
  expiry: string;
  warnings: string[];
  description?: string;
}

const medicineSchema = new Schema<IMedicine>(
  {
    barcode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    genericName: String,
    dosage: { type: String, required: true },
    manufacturer: { type: String, required: true },
    expiry: { type: String, required: true },
    warnings: { type: [String], default: [] },
    description: String,
  },
  { timestamps: true }
);

export const Medicine = mongoose.model<IMedicine>("Medicine", medicineSchema);

export interface IMedicineScan extends Document, Timestamps {
  userId: Types.ObjectId;
  barcode: string;
  medicineName: string;
  expiry?: string;
  found: boolean;
  scanType: "barcode" | "qr";
}

const scanSchema = new Schema<IMedicineScan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    barcode: { type: String, required: true },
    medicineName: { type: String, required: true },
    expiry: String,
    found: { type: Boolean, default: true },
    scanType: { type: String, enum: ["barcode", "qr"], default: "barcode" },
  },
  { timestamps: true }
);

export const MedicineScan = mongoose.model<IMedicineScan>(
  "MedicineScan",
  scanSchema
);

export interface IPrescription extends Document, Timestamps {
  userId: Types.ObjectId;
  medicines: string[];
  rawTextPreview: string;
  source: "ocr" | "upload";
  imageUrl?: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  pharmacistNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  doctorName?: string;
  patientName?: string;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicines: { type: [String], default: [] },
    rawTextPreview: { type: String, default: "" },
    source: { type: String, enum: ["ocr", "upload"], default: "ocr" },
    imageUrl: String,
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    pharmacistNotes: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    doctorName: String,
    patientName: String,
  },
  { timestamps: true }
);

export const Prescription = mongoose.model<IPrescription>(
  "Prescription",
  prescriptionSchema
);

export interface ISymptomRecord extends Document, Timestamps {
  userId: Types.ObjectId;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}

const symptomSchema = new Schema<ISymptomRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    input: { type: Schema.Types.Mixed, required: true },
    result: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const SymptomRecord = mongoose.model<ISymptomRecord>(
  "SymptomRecord",
  symptomSchema
);

export interface IReminder extends Document {
  userId: Types.ObjectId;
  medicineName: string;
  time: string;
  frequency: string;
  dosage?: string;
  schedule: "morning" | "afternoon" | "evening" | "bedtime" | "custom";
  customTime?: string;
  channel: "push" | "email" | "both";
  source: "manual" | "prescription" | "barcode";
  enabled: boolean;
  takenToday: boolean;
  lastNotifiedAt?: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicineName: { type: String, required: true },
    time: { type: String, required: true },
    frequency: { type: String, default: "daily" },
    dosage: String,
    schedule: {
      type: String,
      enum: ["morning", "afternoon", "evening", "bedtime", "custom"],
      default: "morning",
    },
    customTime: String,
    channel: {
      type: String,
      enum: ["push", "email", "both"],
      default: "push",
    },
    source: {
      type: String,
      enum: ["manual", "prescription", "barcode"],
      default: "manual",
    },
    enabled: { type: Boolean, default: true },
    takenToday: { type: Boolean, default: false },
    lastNotifiedAt: Date,
  },
  { timestamps: true }
);

export const Reminder = mongoose.model<IReminder>("Reminder", reminderSchema);

export interface IEmergencyAlert extends Document, Timestamps {
  userId: Types.ObjectId;
  type: string;
  message: string;
  location?: string;
  status: "sent" | "acknowledged" | "resolved";
}

const emergencySchema = new Schema<IEmergencyAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    location: String,
    status: {
      type: String,
      enum: ["sent", "acknowledged", "resolved"],
      default: "sent",
    },
  },
  { timestamps: true }
);

export const EmergencyAlert = mongoose.model<IEmergencyAlert>(
  "EmergencyAlert",
  emergencySchema
);

export interface INotification extends Document, Timestamps {
  userId: Types.ObjectId;
  title: string;
  body: string;
  type: string;
  read: boolean;
  urgent: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, default: "info" },
    read: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export interface IOtpToken extends Document {
  email: string;
  code: string;
  purpose: "verify" | "reset";
  expiresAt: Date;
}

const otpSchema = new Schema<IOtpToken>({
  email: { type: String, required: true, lowercase: true },
  code: { type: String, required: true },
  purpose: { type: String, enum: ["verify", "reset"], required: true },
  expiresAt: { type: Date, required: true },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpToken = mongoose.model<IOtpToken>("OtpToken", otpSchema);
