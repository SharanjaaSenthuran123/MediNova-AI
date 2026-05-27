import bcrypt from "bcryptjs";
import type { UserRole } from "../models/User.js";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  isEmailVerified: boolean;
}

/** Matches npm run seed demo accounts (password: demo123). */
export const DEMO_USERS: DemoUser[] = [
  {
    id: "demo-patient-1",
    name: "Alex Rivera",
    email: "patient@medinova.ai",
    role: "patient",
    avatarInitials: "AR",
    isEmailVerified: true,
  },
  {
    id: "demo-doctor-1",
    name: "Dr. Priya Nair",
    email: "doctor@medinova.ai",
    role: "doctor",
    avatarInitials: "PN",
    isEmailVerified: true,
  },
  {
    id: "demo-admin-1",
    name: "Admin User",
    email: "admin@medinova.ai",
    role: "admin",
    avatarInitials: "AU",
    isEmailVerified: true,
  },
];

let demoPasswordHash: string | null = null;

export async function initDemoAuth(): Promise<void> {
  demoPasswordHash = await bcrypt.hash("demo123", 12);
}

export function findDemoUser(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email === email.toLowerCase());
}

export async function verifyDemoPassword(password: string): Promise<boolean> {
  if (!demoPasswordHash) await initDemoAuth();
  return bcrypt.compare(password, demoPasswordHash!);
}

export function publicDemoUser(user: DemoUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarInitials: user.avatarInitials,
    isEmailVerified: user.isEmailVerified,
  };
}
