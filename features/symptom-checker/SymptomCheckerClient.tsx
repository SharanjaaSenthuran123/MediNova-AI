"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { SymptomWizard } from "@/features/symptom-checker/SymptomWizard";
import { SymptomAssistantAnalyzing } from "@/features/symptom-checker/SymptomAssistantAnalyzing";
import { SymptomResultCard } from "@/components/healthcare/SymptomResultCard";
import type { SymptomCheckRequest, SymptomCheckResult } from "@/types/symptom";

type Phase = "wizard" | "results";

export function SymptomCheckerClient() {
  const [phase, setPhase] = useState<Phase>("wizard");
  const [wizardStep, setWizardStep] = useState(1);
  const [result, setResult] = useState<SymptomCheckResult | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | undefined>();
  const [analyzingRequest, setAnalyzingRequest] =
    useState<SymptomCheckRequest | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const isAnalyzing = wizardStep === 4 && analyzingRequest !== null;

  function handleStartOver() {
    setPhase("wizard");
    setWizardStep(1);
    setResult(null);
    setDemoMode(false);
    setApiMessage(undefined);
    setAnalyzingRequest(null);
    setAnalysisProgress(0);
  }

  function handleResult(
    data: SymptomCheckResult,
    isDemo?: boolean,
    message?: string
  ) {
    setResult(data);
    setDemoMode(Boolean(isDemo));
    setApiMessage(message);
    setAnalyzingRequest(null);
    setPhase("results");
  }

  function handleAnalyzing(request: SymptomCheckRequest, progress: number) {
    setAnalyzingRequest(request);
    setAnalysisProgress(progress);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="glass-strong flex items-center gap-4 rounded-2xl border border-primary/15 px-5 py-4">
        <span className="gradient-icon flex h-12 w-12 items-center justify-center rounded-2xl">
          <Bot className="h-6 w-6 text-primary" />
        </span>
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            MediNova AI Assistant
          </p>
          <p className="text-sm text-muted">
            Step-by-step symptom intake with animated analysis, urgency scoring,
            and confidence-ranked educational insights.
          </p>
        </section>
      </section>

      {phase === "wizard" && (
        <>
          {isAnalyzing && analyzingRequest ? (
            <SymptomAssistantAnalyzing
              request={analyzingRequest}
              progress={analysisProgress}
            />
          ) : (
            <SymptomWizard
              onResult={handleResult}
              onAnalyzing={handleAnalyzing}
              onStepChange={setWizardStep}
            />
          )}
        </>
      )}

      {phase === "results" && result && (
        <SymptomResultCard
          result={result}
          demoMode={demoMode}
          apiMessage={apiMessage}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}
