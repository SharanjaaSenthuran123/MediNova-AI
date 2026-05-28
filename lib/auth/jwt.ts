import jwt, { type SignOptions } from "jsonwebtoken";
import type { UserRole } from "@/lib/models/User";

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;
  if (!secret && process.env.VERCEL) {
    throw new Error("JWT_SECRET is required on Vercel");
  }
  return secret ?? "medinova-dev-secret-change-me";
}

export function signToken(
  payload: JwtPayload,
  expiresIn: SignOptions["expiresIn"] = "7d"
): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
}
