import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { Timestamps } from "../types/timestamps.js";

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export interface IBloodStock extends Document {
  bloodGroup: BloodGroup;
  units: number;
  location: string;
  hospitalName: string;
  lat: number;
  lng: number;
  isRare: boolean;
  lastUpdated: Date;
}

const bloodStockSchema = new Schema<IBloodStock>(
  {
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, index: true },
    units: { type: Number, default: 0 },
    location: { type: String, required: true },
    hospitalName: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isRare: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

bloodStockSchema.index({ bloodGroup: 1, hospitalName: 1 });

export const BloodStock = mongoose.model<IBloodStock>("BloodStock", bloodStockSchema);

export interface IBloodRequest extends Document, Timestamps {
  userId: Types.ObjectId;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospital: string;
  urgency: "normal" | "urgent" | "critical";
  status: "pending" | "accepted" | "matched" | "fulfilled" | "cancelled";
  priorityCategory: "emergency_blood";
  aiUrgencyScore?: number;
  matchedDonorIds: Types.ObjectId[];
  acceptedDonorId?: Types.ObjectId;
  contactPhone: string;
  contactEmail?: string;
  donorResponses: {
    donorId: Types.ObjectId;
    response: "pending" | "accepted" | "rejected";
    respondedAt?: Date;
  }[];
  notes?: string;
  lat: number;
  lng: number;
}

const bloodRequestSchema = new Schema<IBloodRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientName: { type: String, required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    unitsNeeded: { type: Number, required: true, min: 1 },
    hospital: { type: String, required: true },
    urgency: { type: String, enum: ["normal", "urgent", "critical"], default: "normal" },
    status: {
      type: String,
      enum: ["pending", "accepted", "matched", "fulfilled", "cancelled"],
      default: "pending",
    },
    priorityCategory: {
      type: String,
      enum: ["emergency_blood"],
      default: "emergency_blood",
    },
    aiUrgencyScore: Number,
    matchedDonorIds: [{ type: Schema.Types.ObjectId, ref: "Donor" }],
    acceptedDonorId: { type: Schema.Types.ObjectId, ref: "Donor" },
    contactPhone: { type: String, required: true },
    contactEmail: String,
    donorResponses: [
      {
        donorId: { type: Schema.Types.ObjectId, ref: "Donor" },
        response: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        respondedAt: Date,
      },
    ],
    notes: String,
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { timestamps: true }
);

export const BloodRequest = mongoose.model<IBloodRequest>(
  "BloodRequest",
  bloodRequestSchema
);

export interface IDonor extends Document {
  userId?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  city: string;
  lat?: number;
  lng?: number;
  lastDonation?: Date;
  isAvailable: boolean;
  rewardPoints: number;
  qrCodeId: string;
  campaignsJoined: string[];
}

const donorSchema = new Schema<IDonor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    city: { type: String, required: true },
    lat: Number,
    lng: Number,
    lastDonation: Date,
    isAvailable: { type: Boolean, default: true },
    rewardPoints: { type: Number, default: 0 },
    qrCodeId: { type: String, unique: true, required: true },
    campaignsJoined: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Donor = mongoose.model<IDonor>("Donor", donorSchema);

export interface IBloodEmergencyAlert extends Document {
  requestId: Types.ObjectId;
  bloodGroup: BloodGroup;
  message: string;
  urgency: "normal" | "urgent" | "critical";
  resolved: boolean;
}

const alertSchema = new Schema<IBloodEmergencyAlert>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: "BloodRequest", required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    message: { type: String, required: true },
    urgency: { type: String, enum: ["normal", "urgent", "critical"], default: "urgent" },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const BloodEmergencyAlert = mongoose.model<IBloodEmergencyAlert>(
  "BloodEmergencyAlert",
  alertSchema
);
