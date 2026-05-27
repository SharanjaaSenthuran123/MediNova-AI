"use client";

import { motion } from "framer-motion";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { RiskBadge } from "@/components/healthcare/RiskBadge";
import { getUrgencyScore } from "@/lib/symptom-utils";
import type { UrgencyLevel } from "@/types/symptom";
import { cn } from "@/lib/utils";

const urgencyCopy: Record<
  UrgencyLevel,
  { title: string; description: string; ringClass: string }
> = {
  low: {
    title: "Low urgency",
    description: "Monitor at home with self-care; schedule routine care if needed.",
    ringClass: "stroke-success",
  },
  moderate: {
    title: "Moderate urgency",
    description: "Consider seeing a healthcare provider within the next few days.",
    ringClass: "stroke-warning",
  },
  high: {
    title: "High urgency",
    description: "Seek medical evaluation soon — do not delay professional care.",
    ringClass: "stroke-danger",
  },
  emergency: {
    title: "Possible emergency",
    description: "Call emergency services or go to the nearest ER immediately.",
    ringClass: "stroke-danger",
  },
};

interface UrgencyIndicatorProps {
  urgency: UrgencyLevel;
  urgencyScore?: number;
  className?: string;
}

export function UrgencyIndicator({
  urgency,
  urgencyScore,
  className,
}: UrgencyIndicatorProps) {
  const score = getUrgencyScore(urgency, urgencyScore);
  const copy = urgencyCopy[urgency];
  const isCritical = urgency === "high" || urgency === "emergency";

  return (
    <section
      className={cn(
        "glass-strong rounded-2xl p-5",
        isCritical && "border-danger/30 shadow-glow-lg",
        className
      )}
      role="status"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ProgressRing
            value={score}
            max={100}
            size={96}
            strokeWidth={7}
            label={`${score}`}
            sublabel="Urgency"
            colorClass={copy.ringClass}
          />
          <section>
            <RiskBadge urgency={urgency} className="mb-2" />
            <h3 className="text-lg font-semibold text-foreground">{copy.title}</h3>
            <p className="mt-1 max-w-md text-sm text-muted">{copy.description}</p>
          </section>
        </div>

        <div className="hidden h-2 flex-1 overflow-hidden rounded-full bg-border sm:block sm:max-w-xs">
          <motion.div
            className={cn(
              "h-full rounded-full",
              urgency === "low" && "bg-success",
              urgency === "moderate" && "bg-warning",
              (urgency === "high" || urgency === "emergency") && "bg-danger"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </section>
  );
}
