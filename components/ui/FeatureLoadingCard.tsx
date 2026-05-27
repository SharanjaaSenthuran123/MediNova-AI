import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

interface FeatureLoadingCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  steps: string[];
  ariaLabel: string;
  variant?: "primary" | "danger";
  progress?: number;
  progressLabel?: string;
}

export function FeatureLoadingCard({
  icon: Icon,
  title,
  subtitle,
  steps,
  ariaLabel,
  variant = "primary",
  progress,
  progressLabel = "Progress",
}: FeatureLoadingCardProps) {
  const showProgress = typeof progress === "number" && progress > 0;
  const isDanger = variant === "danger";

  return (
    <Card
      className={cn(
        isDanger ? "border-danger/20 bg-danger/5" : "border-primary/20 bg-primary/5"
      )}
    >
      <div
        className="flex flex-col items-center justify-center gap-4 py-12 text-center"
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
      >
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            isDanger ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-6 w-6 animate-pulse" />
        </span>
        <LoadingSpinner size="md" />
        <section>
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </section>

        {showProgress && (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">{progressLabel}</span>
              <span className="font-medium text-primary">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <ul className="mt-2 w-full max-w-xs space-y-2 text-left">
          {steps.map((step) => (
            <li key={step} className="flex items-center gap-2 text-xs text-muted">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full animate-pulse",
                  isDanger ? "bg-danger/60" : "bg-primary/60"
                )}
              />
              {step}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
