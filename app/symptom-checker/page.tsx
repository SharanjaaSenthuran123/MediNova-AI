import { PageHeader } from "@/components/ui/PageHeader";
import { SymptomCheckerClient } from "@/features/symptom-checker/SymptomCheckerClient";
import { ShieldCheck } from "lucide-react";

export default function SymptomCheckerPage() {
  return (
    <>
      <PageHeader
        title="AI Symptom Checker"
        description="Enter symptoms and receive AI-assisted possible conditions, suggestions, and urgency guidance."
      />

      <p className="mb-6 flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Educational demo only — not a medical diagnosis. For emergencies, call your
        local emergency number immediately.
      </p>

      <SymptomCheckerClient />
    </>
  );
}
