import mongoose, { Schema, type Document, type Types } from "mongoose";

export type UserRole = "patient" | "doctor" | "pharmacy" | "donor" | "admin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  avatarInitials: string;
  isEmailVerified: boolean;
  age?: number;
  gender?: string;
  medicalData: {
    bloodType?: string;
    allergies: string[];
    conditions: string[];
  };
  emergencyContacts: {
    id: string;
    name: string;
    relation: string;
    phone: string;
    status: string;
  }[];
  wearableSync: {
    connected: boolean;
    provider?: string;
    lastSync?: string;
    metrics?: Record<string, number>;
  };
  location?: {
    lat: number;
    lng: number;
    address?: string;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "pharmacy", "donor", "admin"],
      default: "patient",
    },
    phone: String,
    profileImage: String,
    avatarInitials: { type: String, default: "U" },
    isEmailVerified: { type: Boolean, default: false },
    age: Number,
    gender: String,
    medicalData: {
      bloodType: String,
      allergies: { type: [String], default: [] },
      conditions: { type: [String], default: [] },
    },
    emergencyContacts: {
      type: [
        {
          id: String,
          name: String,
          relation: String,
          phone: String,
          status: { type: String, default: "active" },
        },
      ],
      default: [],
    },
    wearableSync: {
      connected: { type: Boolean, default: false },
      provider: String,
      lastSync: String,
      metrics: Schema.Types.Mixed,
    },
    location: {
      lat: Number,
      lng: Number,
      address: String,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
