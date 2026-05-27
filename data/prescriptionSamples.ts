/** Demo prescription text for hackathon demos (no image upload required). */
export const prescriptionSamples = [
  {
    label: "Common Rx",
    rawText: `Dr. Sarah Chen
Date: 12/03/2025

Rx:
1. Amoxicillin 500mg — 1 capsule 3x daily for 7 days
2. Ibuprofen 400mg tablets — 1 tablet every 8 hours as needed
3. Cetirizine 10mg — 1 tablet at bedtime

Take with food. Finish full antibiotic course.`,
  },
  {
    label: "Chronic care",
    rawText: `Patient: Demo User
Metformin 500mg tablets — 1 tablet twice daily with meals
Lisinopril 10mg — 1 tablet every morning
Atorvastatin 20mg — 1 tablet at night

Refill in 30 days. Contact clinic for side effects.`,
  },
] as const;
