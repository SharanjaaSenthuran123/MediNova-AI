import { Activity, AlertTriangle, Smile } from "lucide-react";
import type { SymptomCheckRequest } from "@/types/symptom";
import { cn } from "@/lib/utils";

const options: {
  value: SymptomCheckRequest["severity"];
  label: string;
  description: string;
  icon: typeof Smile;
  color: string;
}[] = [
  {
    value: "mild",
    label: "Mild",
    description: "Noticeable but manageable",
    icon: Smile,
    color: "border-success/40 bg-success/10 text-success",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Interferes with daily activities",
    icon: Activity,
    color: "border-warning/40 bg-warning/10 text-warning",
  },
  {
    value: "severe",
    label: "Severe",
    description: "Hard to function — needs attention",
    icon: AlertTriangle,
    color: "border-danger/40 bg-danger/10 text-danger",
  },
];

interface SymptomSeverityPickerProps {
  value: SymptomCheckRequest["severity"];
  onChange: (value: SymptomCheckRequest["severity"]) => void;
  disabled?: boolean;
}

export function SymptomSeverityPicker({
  value,
  onChange,
  disabled,
}: SymptomSeverityPickerProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">
        How severe are your symptoms?
      </legend>
      <ul className="grid gap-3 sm:grid-cols-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = value === opt.value;
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  "flex w-full flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  selected
                    ? cn(opt.color, "shadow-glow scale-[1.02]")
                    : "glass border-border hover:border-primary/30",
                  disabled && "pointer-events-none opacity-50"
                )}
                aria-pressed={selected}
              >
                <Icon className="h-5 w-5" />
                <span className="font-semibold text-foreground">{opt.label}</span>
                <span className="text-xs text-muted">{opt.description}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
