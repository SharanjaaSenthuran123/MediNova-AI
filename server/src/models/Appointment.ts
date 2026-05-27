import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { Timestamps } from "../types/timestamps.js";

export interface IAppointment extends Document, Timestamps {
  userId: Types.ObjectId;
  doctorId?: Types.ObjectId;
  providerName: string;
  specialty: string;
  date: string;
  time: string;
  type: "virtual" | "in-person";
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  prepChecklist: string[];
}

const appointmentSchema = new Schema<IAppointment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    providerName: { type: String, required: true },
    specialty: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ["virtual", "in-person"], default: "virtual" },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: String,
    prepChecklist: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);
