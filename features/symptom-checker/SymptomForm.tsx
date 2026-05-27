"use client";

import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SymptomExampleChips } from "@/features/symptom-checker/SymptomExampleChips";
import { symptomRequestSchema } from "@/lib/symptom-schema";
import { saveSymptomHistory } from "@/lib/history-client";
import { saveAssistantContext } from "@/lib/assistant-context";
import type {
  SymptomCheckApiResponse,
  SymptomCheckRequest,
  SymptomCheckResult,
} from "@/types/symptom";

interface SymptomFormProps {
  onResult: (result: SymptomCheckResult, demoMode?: boolean, message?: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

function firstFieldError(
  fieldErrors: Record<string, string[] | undefined>
): string | null {
  const first = Object.values(fieldErrors).flat().find(Boolean);
  return first ?? null;
}

export function SymptomForm({ onResult, onLoadingChange }: SymptomFormProps) {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("32");
  const [gender, setGender] = useState("prefer not to say");
  const [duration, setDuration] = useState("2 days");
  const [severity, setSeverity] =
    useState<SymptomCheckRequest["severity"]>("mild");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setLoadingState(next: boolean) {
    setLoading(next);
    onLoadingChange?.(next);
  }

  function handleExampleSelect(text: string) {
    setSymptoms(text);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      symptoms: symptoms.trim(),
      age: Number(age),
      gender,
      duration: duration.trim(),
      severity,
    };

    const clientParsed = symptomRequestSchema.safeParse(payload);
    if (!clientParsed.success) {
      const fieldErrors = clientParsed.error.flatten().fieldErrors;
      setError(firstFieldError(fieldErrors) ?? "Please check your input.");
      return;
    }

    setLoadingState(true);

    try {
      const res = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientParsed.data),
      });

      const data = (await res.json()) as SymptomCheckApiResponse & {
        error?: string | Record<string, string[] | undefined>;
        message?: string;
      };

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
        return;
      }

      onResult(data, Boolean(data.demoMode), data.message);
      void saveSymptomHistory(clientParsed.data, data);
      saveAssistantContext(clientParsed.data.symptoms, data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoadingState(false);
    }
  }

  const symptomsCount = symptoms.trim().length;
  const symptomsHint =
    symptomsCount === 0
      ? "Min. 3 characters"
      : symptomsCount < 3
        ? `${3 - symptomsCount} more character${3 - symptomsCount === 1 ? "" : "s"} needed`
        : `${symptomsCount} / 2000`;

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <section className="space-y-2">
          <Textarea
            label="Describe your symptoms"
            placeholder="e.g. fever, headache, dry cough for 2 days..."
            value={symptoms}
            onChange={(e) => {
              setSymptoms(e.target.value);
              if (error) setError(null);
            }}
            required
            disabled={loading}
          />
          <p
            className={`text-right text-xs ${
              symptomsCount > 0 && symptomsCount < 3
                ? "text-warning"
                : "text-muted"
            }`}
          >
            {symptomsHint}
          </p>
          <SymptomExampleChips onSelect={handleExampleSelect} disabled={loading} />
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Age"
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            disabled={loading}
          />
          <Select
            label="Gender"
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={loading}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer not to say">Prefer not to say</option>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="How long have you had symptoms?"
            placeholder="e.g. 2 days, 1 week"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            disabled={loading}
          />
          <Select
            label="Severity"
            id="severity"
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value as SymptomCheckRequest["severity"])
            }
            disabled={loading}
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </Select>
        </div>

        {error && <FormError message={error} />}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Analyzing symptoms...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze with AI
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
