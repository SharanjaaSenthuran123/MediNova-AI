import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { Timestamps } from "../types/timestamps.js";

export interface IPatient extends Document, Timestamps {
  userId?: Types.ObjectId;
  managedBy: Types.ObjectId;
  name: string;
  email?: string;
  age: number;
  gender: string;
  condition: string;
  status: "stable" | "monitoring" | "critical";
  healthScore: number;
  doctorName: string;
  doctorId?: Types.ObjectId;
  medicalHistory: { date: string; note: string; type: string }[];
  avatarInitials: string;
  lastVisit: string;
}

const patientSchema = new Schema<IPatient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    managedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: String,
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    condition: { type: String, required: true },
    status: {
      type: String,
      enum: ["stable", "monitoring", "critical"],
      default: "stable",
    },
    healthScore: { type: Number, default: 80 },
    doctorName: { type: String, default: "" },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    medicalHistory: {
      type: [{ date: String, note: String, type: String }],
      default: [],
    },
    avatarInitials: { type: String, default: "PT" },
    lastVisit: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Patient = mongoose.model<IPatient>("Patient", patientSchema);
