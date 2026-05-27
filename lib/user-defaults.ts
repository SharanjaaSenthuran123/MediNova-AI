import type { UserRecord } from "@/types/user";

/** Ensures Phase 12 fields exist on records created before integrations shipped. */
export function normalizeUserRecord(record: UserRecord): UserRecord {
  return {
    ...record,
    reminders: record.reminders ?? [],
    appointments: record.appointments ?? [],
    wearableSync: record.wearableSync ?? { connected: false },
  };
}
