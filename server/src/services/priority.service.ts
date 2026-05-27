export type PriorityLevel = 1 | 2 | 3;

export type PriorityCategory =
  | "emergency_blood"
  | "emergency_medicine"
  | "normal_medicine";

/** Lower number = higher priority (processed first). */
export const PRIORITY_MAP: Record<PriorityCategory, PriorityLevel> = {
  emergency_blood: 1,
  emergency_medicine: 2,
  normal_medicine: 3,
};

export function categoryFromBloodUrgency(
  urgency: "normal" | "urgent" | "critical"
): PriorityCategory {
  return urgency === "critical" || urgency === "urgent"
    ? "emergency_blood"
    : "emergency_blood";
}

export function categoryFromOrder(isEmergency: boolean): PriorityCategory {
  return isEmergency ? "emergency_medicine" : "normal_medicine";
}

export function priorityScore(
  category: PriorityCategory,
  createdAt: Date,
  urgencyBoost = 0
): number {
  const base = PRIORITY_MAP[category] * 1_000_000;
  const ageMs = Date.now() - createdAt.getTime();
  const ageBoost = Math.min(Math.floor(ageMs / 60_000), 999);
  return base - ageBoost - urgencyBoost;
}

export function sortByPriority<
  T extends { priorityCategory: PriorityCategory; createdAt: Date; urgencyBoost?: number }
>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      priorityScore(a.priorityCategory, a.createdAt, a.urgencyBoost ?? 0) -
      priorityScore(b.priorityCategory, b.createdAt, b.urgencyBoost ?? 0)
  );
}
