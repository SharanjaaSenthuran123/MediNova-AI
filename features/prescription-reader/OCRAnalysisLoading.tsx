"use client";

import { motion } from "framer-motion";
import { ScanLine, ScanText } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Card } from "@/components/ui/Card";
import type { OCRStage } from "@/features/prescription-reader/ocr.helpers";
import { cn } from "@/lib/utils";

interface OCRAnalysisLoadingProps {
  progress?: number;
  stage?: OCRStage;
  stageLabel?: string;
}

const STAGE_ORDER: OCRStage[] = [
  "loading-engine",
  "loading-language",
  "recognizing",
];

const STAGE_STEPS: Record<OCRStage, string> = {
  idle: "Preparing scanner",
  "loading-engine": "Loading OCR engine",
  "loading-language": "Loading language model",
  recognizing: "Recognizing prescription text",
  complete: "Finalizing results",
};

function stageIndex(stage: OCRStage): number {
  const idx = STAGE_ORDER.indexOf(stage);
  return idx >= 0 ? idx : 0;
}

export function OCRAnalysisLoading({
  progress = 0,
  stage = "loading-engine",
  stageLabel,
}: OCRAnalysisLoadingProps) {
  const activeStep = stageIndex(stage);
  const displayProgress = progress > 0 ? progress : 8;

  return (
    <Card variant="gradient" className="overflow-hidden">
      <div
        className="flex flex-col items-center gap-6 py-10 text-center"
        role="status"
        aria-live="polite"
        aria-label="Reading prescription"
      >
        <div className="relative">
          <ProgressRing
            value={displayProgress}
            max={100}
            size={96}
            label={`${displayProgress}%`}
            sublabel="OCR"
            colorClass="stroke-primary"
          />
          <motion.span
            className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow"
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ScanText className="h-4 w-4" />
          </motion.span>
        </div>

        <section className="space-y-1">
          <p className="text-lg font-semibold text-foreground">
            Scanning prescription
          </p>
          <p className="text-sm text-muted">
            {stageLabel ?? STAGE_STEPS[stage]}
          </p>
        </section>

        <div className="relative h-16 w-full max-w-sm overflow-hidden rounded-xl border border-primary/20 bg-primary/5">
          <div className="absolute inset-0 ocr-scan-grid opacity-60" />
          <div className="absolute inset-x-6 top-0 h-px ocr-scan-line bg-gradient-to-r from-transparent via-primary to-transparent" />
          <ScanLine className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary/40" />
        </div>

        <ul className="w-full max-w-sm space-y-2 text-left">
          {STAGE_ORDER.map((step, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <li
                key={step}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  active && "glass border border-primary/20 text-foreground",
                  done && "text-muted",
                  !done && !active && "text-muted/60"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    done && "bg-success/15 text-success",
                    active && "bg-primary/15 text-primary animate-pulse",
                    !done && !active && "bg-border/50 text-muted"
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>
                {STAGE_STEPS[step]}
              </li>
            );
          })}
        </ul>

        <div className="w-full max-w-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Overall progress</span>
            <span className="font-semibold text-primary">{displayProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border/80">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
