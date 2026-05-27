import type { UserProfile, UserRecord } from "@/types/user";

export function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function createEmptyUserRecord(profile: UserProfile): UserRecord {
  return {
    profile,
    emergencyContacts: [],
    symptomHistory: [],
    prescriptionHistory: [],
    barcodeHistory: [],
    reminders: [],
    appointments: [],
    wearableSync: { connected: false },
  };
}

export function formatProfileValidationError(
  fieldErrors: Record<string, string[] | undefined>
): string {
  const first = Object.values(fieldErrors).flat().find(Boolean);
  return first ?? "Invalid profile data";
}
