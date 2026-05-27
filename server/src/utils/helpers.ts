import type { Response } from "express";
import type { IUser } from "../models/User.js";

export function publicUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    profileImage: user.profileImage,
    avatarInitials: user.avatarInitials,
    age: user.age,
    gender: user.gender,
    isEmailVerified: user.isEmailVerified,
    medicalData: user.medicalData,
    location: user.location
      ? {
          lat: user.location.lat,
          lng: user.location.lng,
          address: user.location.address,
          updatedAt: user.location.updatedAt?.toISOString?.() ?? undefined,
        }
      : undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function setAuthCookies(
  res: Response,
  input: { userId: string; token: string; role: string; remember?: boolean }
) {
  const maxAge = (input.remember ? 30 : 7) * 24 * 60 * 60 * 1000;
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
  res.cookie("medinova_uid", input.userId, opts);
  res.cookie("medinova_token", input.token, opts);
  res.cookie("medinova_role", input.role, {
    ...opts,
    httpOnly: false,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("medinova_uid", { path: "/" });
  res.clearCookie("medinova_token", { path: "/" });
  res.clearCookie("medinova_role", { path: "/" });
}

export const DEFAULT_PREP = [
  "List current symptoms and when they started",
  "Bring medication list or barcode scan history",
  "Note questions for your provider",
  "Arrive 10 minutes early (in-person) or test video link (virtual)",
];

export function toAppointmentDto(doc: {
  _id: { toString(): string };
  userId: { toString(): string };
  providerName: string;
  specialty: string;
  date: string;
  time: string;
  type: "virtual" | "in-person";
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  prepChecklist: string[];
  createdAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    providerName: doc.providerName,
    specialty: doc.specialty,
    date: doc.date,
    time: doc.time,
    type: doc.type,
    status: doc.status,
    notes: doc.notes,
    prepChecklist: doc.prepChecklist,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  };
}
