import { FeaturePageShell } from "@/components/layout/FeaturePageShell";
import { SymptomCheckerClient } from "@/features/symptom-checker/SymptomCheckerClient";

export default function SymptomCheckerPage() {
  return (
    <FeaturePageShell
      eyebrow="AI Health"
      title="AI Symptom Checker"
      description="Professional AI medical assistant with step-by-step intake, animated analysis, urgency indicators, and confidence-scored condition insights."
      disclaimer="Educational demo only — not a medical diagnosis. For emergencies, call your local emergency number immediately."
    >
      <SymptomCheckerClient />
    </FeaturePageShell>
  );
}
