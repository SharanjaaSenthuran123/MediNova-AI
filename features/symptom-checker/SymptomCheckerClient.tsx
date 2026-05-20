"use client";

import { useState } from "react";
import { SymptomForm } from "@/features/symptom-checker/SymptomForm";
import { SymptomResultCard } from "@/components/healthcare/SymptomResultCard";
import { Card } from "@/components/ui/Card";
import type { SymptomCheckResult } from "@/types/symptom";
import { Stethoscope } from "lucide-react";

export function SymptomCheckerClient() {
  const [result, setResult] = useState<SymptomCheckResult | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SymptomForm
        onResult={(data, isDemo) => {
          setResult(data);
          setDemoMode(Boolean(isDemo));
        }}
      />

      <section>
        {result ? (
          <SymptomResultCard result={result} demoMode={demoMode} />
        ) : (
          <Card className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Stethoscope className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">Results will appear here</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Enter your symptoms and tap Analyze with AI to see possible conditions,
              suggestions, and urgency guidance.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
