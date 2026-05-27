import type { Medicine, MedicineAIInsight } from "@/types/medicine";

export function getDemoMedicineInsight(medicine: Medicine): MedicineAIInsight {
  const tips: string[] = [
    `Always verify "${medicine.name}" matches the physical package label.`,
    "Check for allergies to the active ingredient before first use.",
  ];

  if (medicine.warnings.some((w) => /alcohol/i.test(w))) {
    tips.push("Avoid alcohol while taking this medicine.");
  }
  if (medicine.warnings.some((w) => /drowsiness|driving/i.test(w))) {
    tips.push("Do not drive until you know how this medicine affects you.");
  }
  if (/antibiotic|amoxicillin/i.test(medicine.name + medicine.genericName)) {
    tips.push("Finish the full antibiotic course even if symptoms improve.");
  }

  return {
    safetySummary: `${medicine.genericName} (${medicine.name}) — ${medicine.description ?? "Use only as directed on the label or by your clinician."} This is educational demo guidance, not a prescription.`,
    interactionTips: tips.slice(0, 4),
    whenToSeekHelp: [
      "Unexpected rash, swelling, or difficulty breathing",
      "Symptoms worsen or do not improve as expected",
      "Accidental overdose or wrong dose taken",
    ],
    source: "demo",
  };
}
