import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { RiskBadge } from "@/components/healthcare/RiskBadge";
import type { SymptomCheckResult } from "@/types/symptom";
import { AlertCircle, Lightbulb, Stethoscope } from "lucide-react";

interface SymptomResultCardProps {
  result: SymptomCheckResult;
  demoMode?: boolean;
}

export function SymptomResultCard({ result, demoMode }: SymptomResultCardProps) {
  return (
    <div className="space-y-4">
      {demoMode && (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
          Demo mode: add <code className="text-xs">OPENAI_API_KEY</code> to{" "}
          <code className="text-xs">.env.local</code> for live AI analysis.
        </p>
      )}

      <Card>
        <CardHeader>
          <section className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Analysis summary
            </CardTitle>
            <RiskBadge urgency={result.urgency} />
          </section>
          <CardDescription>
            Possible conditions (educational — not a diagnosis)
          </CardDescription>
        </CardHeader>
        <ul className="space-y-2">
          {result.possibleConditions.map((condition) => (
            <li
              key={condition}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {condition}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-primary" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted">
          {result.suggestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-5 w-5 text-warning" />
            Seek medical care if
          </CardTitle>
        </CardHeader>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted">
          {result.seekDoctorIf.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <p className="rounded-xl border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        {result.disclaimer}
      </p>
    </div>
  );
}
