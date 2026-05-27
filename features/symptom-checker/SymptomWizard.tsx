"use client";

import { useCallback, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { SymptomExampleChips } from "@/features/symptom-checker/SymptomExampleChips";
import { SymptomSeverityPicker } from "@/features/symptom-checker/SymptomSeverityPicker";
import { SymptomStepIndicator } from "@/features/symptom-checker/SymptomStepIndicator";
import { symptomRequestSchema } from "@/lib/schemas/symptom";
import { enrichSymptomResult } from "@/lib/symptom-utils";
import { saveSymptomHistory } from "@/lib/history-client";
import { saveAssistantContext } from "@/lib/assistant-context";
import type {
  SymptomCheckApiResponse,
  SymptomCheckRequest,
  SymptomCheckResult,
} from "@/types/symptom";

function firstFieldError(
  fieldErrors: Record<string, string[] | undefined>
): string | null {
  const first = Object.values(fieldErrors).flat().find(Boolean);
  return first ?? null;
}

interface SymptomWizardProps {
  onResult: (result: SymptomCheckResult, demoMode?: boolean, message?: string) => void;
  onAnalyzing: (request: SymptomCheckRequest, progress: number) => void;
  onStepChange?: (step: number) => void;
}

export function SymptomWizard({
  onResult,
  onAnalyzing,
  onStepChange,
}: SymptomWizardProps) {
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("32");
  const [gender, setGender] = useState("prefer not to say");
  const [duration, setDuration] = useState("2 days");
  const [severity, setSeverity] =
    useState<SymptomCheckRequest["severity"]>("mild");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      setStep(next);
      onStepChange?.(next);
    },
    [onStepChange]
  );

  function buildPayload(): SymptomCheckRequest {
    return {
      symptoms: symptoms.trim(),
      age: Number(age),
      gender,
      duration: duration.trim(),
      severity,
    };
  }

  function validateStep(target: number): boolean {
    setError(null);
    if (target <= 1) {
      if (symptoms.trim().length < 3) {
        setError("Please describe your symptoms in at least 3 characters.");
        return false;
      }
      return true;
    }
    if (target <= 2) {
      const partial = symptomRequestSchema.safeParse(buildPayload());
      if (!partial.success) {
        setError(
          firstFieldError(partial.error.flatten().fieldErrors) ??
            "Please complete your profile details."
        );
        return false;
      }
      return true;
    }
    return true;
  }

  function handleNext() {
    if (!validateStep(step + 1)) return;
    goTo(step + 1);
  }

  function handleBack() {
    setError(null);
    goTo(Math.max(1, step - 1));
  }

  async function runAnalysis() {
    setError(null);
    const payload = buildPayload();
    const parsed = symptomRequestSchema.safeParse(payload);
    if (!parsed.success) {
      setError(
        firstFieldError(parsed.error.flatten().fieldErrors) ??
          "Please check your input."
      );
      return;
    }

    setSubmitting(true);
    goTo(4);
    onAnalyzing(parsed.data, 8);

    let progress = 8;
    const tick = setInterval(() => {
      progress = Math.min(progress + 6, 92);
      onAnalyzing(parsed.data, progress);
    }, 320);

    try {
      const res = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await res.json()) as SymptomCheckApiResponse & {
        error?: string | Record<string, string[] | undefined>;
        message?: string;
      };

      clearInterval(tick);
      onAnalyzing(parsed.data, 100);

      if (!res.ok) {
        const msg =
          typeof data.message === "string"
            ? data.message
            : typeof data.error === "string"
              ? data.error
              : data.error && typeof data.error === "object"
                ? firstFieldError(data.error)
                : null;
        setError(msg ?? "Please check your input and try again.");
        goTo(3);
        return;
      }

      const enriched = enrichSymptomResult(data);
      onResult(enriched, Boolean(data.demoMode), data.message);
      void saveSymptomHistory(parsed.data, enriched);
      saveAssistantContext(parsed.data.symptoms, enriched);
    } catch {
      clearInterval(tick);
      setError("Network error. Please check your connection and try again.");
      goTo(3);
    } finally {
      setSubmitting(false);
    }
  }

  const symptomsCount = symptoms.trim().length;

  return (
    <Card variant="gradient" padding="lg" className="overflow-hidden">
      <SymptomStepIndicator currentStep={step} className="mb-8" />

      {step === 1 && (
        <section className="animate-fade-in space-y-5">
          <header>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Tell us how you feel
            </h2>
            <p className="mt-1 text-sm text-muted">
              Describe symptoms in your own words. Our AI assistant will analyze
              patterns and urgency — for educational guidance only.
            </p>
          </header>

          <Textarea
            label="Symptom description"
            placeholder="e.g. fever, headache, dry cough for 2 days..."
            value={symptoms}
            onChange={(e) => {
              setSymptoms(e.target.value);
              if (error) setError(null);
            }}
            disabled={submitting}
          />
          <p
            className={`text-right text-xs ${
              symptomsCount > 0 && symptomsCount < 3
                ? "text-warning"
                : "text-muted"
            }`}
          >
            {symptomsCount === 0
              ? "Min. 3 characters"
              : symptomsCount < 3
                ? `${3 - symptomsCount} more needed`
                : `${symptomsCount} / 2000`}
          </p>
          <SymptomExampleChips
            onSelect={(text) => {
              setSymptoms(text);
              setError(null);
            }}
            disabled={submitting}
          />
        </section>
      )}

      {step === 2 && (
        <section className="animate-fade-in space-y-5">
          <header>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <UserRound className="h-5 w-5 text-secondary" />
              Your health profile
            </h2>
            <p className="mt-1 text-sm text-muted">
              Context helps the assistant estimate urgency more accurately.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Age"
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={submitting}
            />
            <Select
              label="Gender"
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={submitting}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer not to say">Prefer not to say</option>
            </Select>
          </div>

          <Input
            label="How long have you had symptoms?"
            placeholder="e.g. 2 days, 1 week"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={submitting}
          />

          <SymptomSeverityPicker
            value={severity}
            onChange={setSeverity}
            disabled={submitting}
          />
        </section>
      )}

      {step === 3 && (
        <section className="animate-fade-in space-y-5">
          <header>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Review before analysis
            </h2>
            <p className="mt-1 text-sm text-muted">
              Confirm your details, then run the AI medical assistant.
            </p>
          </header>

          <ul className="space-y-3">
            <li className="glass rounded-xl px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Symptoms
              </p>
              <p className="mt-1 text-sm text-foreground">{symptoms.trim()}</p>
            </li>
            <li className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Age", value: age },
                { label: "Duration", value: duration },
                { label: "Severity", value: severity },
              ].map((row) => (
                <div key={row.label} className="glass rounded-xl px-4 py-3">
                  <p className="text-xs text-muted">{row.label}</p>
                  <p className="mt-0.5 font-medium capitalize text-foreground">
                    {row.value}
                  </p>
                </div>
              ))}
            </li>
          </ul>
        </section>
      )}

      {error && <FormError message={error} className="mt-4" />}

      {step < 4 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={submitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" className="flex-1 sm:flex-none" onClick={handleNext}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1 sm:flex-none"
              onClick={runAnalysis}
              disabled={submitting}
            >
              <Sparkles className="h-4 w-4" />
              Run AI Analysis
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
