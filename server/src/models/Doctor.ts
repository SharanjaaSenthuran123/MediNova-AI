import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IDoctor extends Document {
  userId?: Types.ObjectId;
  name: string;
  email: string;
  specialty: string;
  hospital: string;
  experience: number;
  rating: number;
  reviews: number;
  patients: number;
  availability: "available" | "busy" | "offline";
  schedule: { day: string; slots: string[] }[];
  bio?: string;
  avatarInitials: string;
}

const doctorSchema = new Schema<IDoctor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    specialty: { type: String, required: true },
    hospital: { type: String, required: true },
    experience: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    patients: { type: Number, default: 0 },
    availability: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },
    schedule: {
      type: [{ day: String, slots: [String] }],
      default: [],
    },
    bio: String,
    avatarInitials: { type: String, default: "DR" },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model<IDoctor>("Doctor", doctorSchema);
