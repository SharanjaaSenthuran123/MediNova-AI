"use client";

import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { SymptomCheckRequest, SymptomCheckResult } from "@/types/symptom";

interface SymptomFormProps {
  onResult: (result: SymptomCheckResult, demoMode?: boolean) => void;
}

export function SymptomForm({ onResult }: SymptomFormProps) {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("32");
  const [gender, setGender] = useState("prefer not to say");
  const [duration, setDuration] = useState("2 days");
  const [severity, setSeverity] = useState<SymptomCheckRequest["severity"]>("mild");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload: SymptomCheckRequest = {
      symptoms: symptoms.trim(),
      age: Number(age),
      gender,
      duration,
      severity,
    };

    try {
      const res = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : data.error?.symptoms?.[0] ?? "Please check your input and try again.";
        setError(msg);
        return;
      }

      onResult(data, Boolean(data.demoMode));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Describe your symptoms"
          placeholder="e.g. fever, headache, dry cough for 2 days..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Age"
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
          <div className="w-full space-y-2">
            <label htmlFor="gender" className="text-sm font-medium text-foreground">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="How long have you had symptoms?"
            placeholder="e.g. 2 days, 1 week"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <div className="w-full space-y-2">
            <label htmlFor="severity" className="text-sm font-medium text-foreground">
              Severity
            </label>
            <select
              id="severity"
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value as SymptomCheckRequest["severity"])
              }
              className="flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

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
