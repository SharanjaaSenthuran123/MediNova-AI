import type { AuthCredential } from "@/types/auth";
import type { AuthUser } from "@/types/auth";

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function credentialToAuthUser(credential: AuthCredential): AuthUser {
  return {
    id: credential.userId,
    email: credential.email,
    name: credential.name,
    role: credential.role,
    avatarInitials: initialsFromName(credential.name),
  };
}
