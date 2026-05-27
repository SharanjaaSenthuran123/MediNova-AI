"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const analysisSteps = [
  {
    phase: "Input",
    text: "Symptoms detected: fever, headache, mild cough",
  },
  {
    phase: "Analyzing",
    text: "Cross-referencing urgency patterns & duration (2 days)...",
  },
  {
    phase: "AI Match",
    text: "Possible conditions: Common cold · Viral pharyngitis",
  },
  {
    phase: "Guidance",
    text: "Urgency: Moderate · Rest, fluids, monitor fever",
  },
] as const;

export function LiveAIAnalysis({ className }: { className?: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);

  const current = analysisSteps[stepIndex];
  const fullText = current.text;

  useEffect(() => {
    setVisibleChars(0);
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex += 1;
      setVisibleChars(charIndex);
      if (charIndex >= fullText.length) clearInterval(typeInterval);
    }, 22);

    return () => clearInterval(typeInterval);
  }, [stepIndex, fullText]);

  useEffect(() => {
    const cycle = setInterval(() => {
      setStepIndex((i) => (i + 1) % analysisSteps.length);
    }, 4200);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div
      className={cn(
        "glass overflow-hidden rounded-xl border border-primary/20",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Simulated live AI health analysis"
    >
      <div className="flex items-center justify-between border-b border-white/20 px-4 py-2.5 dark:border-white/10">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live AI analysis
        </span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          Demo simulation
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-accent animate-pulse-slow" />
          <span className="text-xs font-medium text-muted">
            Phase:{" "}
            <span className="text-foreground">{current.phase}</span>
          </span>
          {stepIndex === 1 && (
            <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-primary" />
          )}
        </div>

        <p className="min-h-[2.75rem] font-mono text-sm leading-relaxed text-foreground">
          {fullText.slice(0, visibleChars)}
          <span className="animate-pulse text-primary">|</span>
        </p>

        <div className="flex gap-1">
          {analysisSteps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                i === stepIndex ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
