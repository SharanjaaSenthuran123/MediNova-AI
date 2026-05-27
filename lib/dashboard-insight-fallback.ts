interface DashboardVitals {
  heartRate?: number;
  sleep?: number;
  adherence?: number;
  hydration?: number;
  riskScore?: number;
}

const INSIGHTS = [
  "Your vitals look stable today. Keep up your medicine schedule and hydration — small habits compound into better long-term wellness.",
  "Sleep and adherence trends are positive. Consider a short walk after meals to support heart health and energy levels.",
  "Hydration is trending well. Pair it with consistent sleep timing to help your body recover and maintain steady energy.",
  "Heart rate patterns are within a healthy range. Log any new symptoms in the Symptom Checker for educational guidance.",
];

export function getDemoDashboardInsight(vitals?: DashboardVitals): string {
  const hr = vitals?.heartRate ?? 72;
  const sleep = vitals?.sleep ?? 86;
  const adherence = vitals?.adherence ?? 94;
  const hydration = vitals?.hydration ?? 1.8;

  if (adherence >= 90 && sleep >= 80) {
    return `Strong week: ${adherence}% medicine adherence and ${sleep}% sleep score. Heart rate averaging ${hr} bpm with ${hydration}L hydration — maintain your current routine.`;
  }

  if (hydration < 1.5) {
    return `Hydration at ${hydration}L is below target. Aim for 2L today while keeping adherence at ${adherence}%. Your resting heart rate of ${hr} bpm looks stable.`;
  }

  const index =
    Math.abs(Math.round(hr + sleep + adherence)) % INSIGHTS.length;
  return INSIGHTS[index]!;
}
