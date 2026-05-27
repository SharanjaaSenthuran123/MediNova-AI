import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const WIZARD_STEPS = [
  { id: 1, label: "Symptoms", short: "Describe" },
  { id: 2, label: "Profile", short: "Details" },
  { id: 3, label: "Review", short: "Confirm" },
  { id: 4, label: "AI Analysis", short: "Analyze" },
] as const;

interface SymptomStepIndicatorProps {
  currentStep: number;
  className?: string;
}

export function SymptomStepIndicator({
  currentStep,
  className,
}: SymptomStepIndicatorProps) {
  return (
    <nav aria-label="Symptom check progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between gap-2">
        {WIZARD_STEPS.map((step, index) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;

          return (
            <li key={step.id} className="flex flex-1 items-center">
              <div className="flex w-full flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                    done && "bg-primary text-primary-foreground shadow-glow",
                    active &&
                      "bg-gradient-to-br from-primary to-secondary text-white shadow-glow ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                    !done &&
                      !active &&
                      "glass border border-border text-muted"
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span className="hidden text-center sm:block sm:text-left">
                  <span
                    className={cn(
                      "block text-xs font-semibold",
                      active ? "text-foreground" : "text-muted"
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-muted">{step.short}</span>
                </span>
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <span
                  className={cn(
                    "mx-1 hidden h-0.5 flex-1 rounded-full sm:block",
                    done ? "bg-primary/60" : "bg-border"
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
