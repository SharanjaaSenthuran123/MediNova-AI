import { Sparkles } from "lucide-react";
import { FeatureLoadingCard } from "@/components/ui/FeatureLoadingCard";

export function SymptomAnalysisLoading() {
  return (
    <FeatureLoadingCard
      icon={Sparkles}
      title="Analyzing your symptoms"
      subtitle="Checking patterns, urgency, and care suggestions…"
      ariaLabel="Analyzing symptoms"
      steps={[
        "Reviewing symptom profile",
        "Estimating urgency",
        "Preparing guidance",
      ]}
    />
  );
}
