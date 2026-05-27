export type UserRole = "patient" | "doctor" | "pharmacy" | "donor" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarInitials: string;
}

export interface AuthCredential {
  userId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  role?: UserRole;
  remember?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface OtpRecord {
  email: string;
  code: string;
  expiresAt: number;
  purpose: "reset" | "verify";
}
