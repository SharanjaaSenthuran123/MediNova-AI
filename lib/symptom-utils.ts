import type {
  ConditionMatch,
  SymptomCheckResult,
  UrgencyLevel,
} from "@/types/symptom";

const URGENCY_SCORE: Record<UrgencyLevel, number> = {
  low: 22,
  moderate: 48,
  high: 74,
  emergency: 94,
};

export function getUrgencyScore(
  urgency: UrgencyLevel,
  explicit?: number
): number {
  if (typeof explicit === "number") {
    return Math.min(100, Math.max(0, Math.round(explicit)));
  }
  return URGENCY_SCORE[urgency];
}

export function getConditionMatches(result: SymptomCheckResult): ConditionMatch[] {
  if (result.conditions?.length) {
    return result.conditions;
  }
  return result.possibleConditions.map((name, index) => ({
    name,
    confidence: Math.max(38, 88 - index * 14),
  }));
}

export function enrichSymptomResult(result: SymptomCheckResult): SymptomCheckResult {
  const conditions = getConditionMatches(result);
  const topConfidence = conditions[0]?.confidence ?? 70;
  return {
    ...result,
    possibleConditions: conditions.map((c) => c.name),
    conditions,
    urgencyScore: getUrgencyScore(result.urgency, result.urgencyScore),
    overallConfidence:
      result.overallConfidence ??
      (Math.round(
        conditions.reduce((sum, c) => sum + c.confidence, 0) / conditions.length
      ) || topConfidence),
  };
}
