"use client";

import { useEffect, useState } from "react";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import type { SymptomCheckRequest } from "@/types/symptom";
import { cn } from "@/lib/utils";

const phases = [
  { label: "Parsing symptoms", detail: "Extracting keywords and duration patterns" },
  { label: "Clinical reasoning", detail: "Matching educational condition profiles" },
  { label: "Urgency scoring", detail: "Evaluating red flags and severity level" },
  { label: "Care plan", detail: "Generating suggestions and warning signs" },
] as const;

interface SymptomAssistantAnalyzingProps {
  request: SymptomCheckRequest;
  progress: number;
}

export function SymptomAssistantAnalyzing({
  request,
  progress,
}: SymptomAssistantAnalyzingProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const snippet = request.symptoms.slice(0, 72);
  const displaySnippet =
    snippet.length < request.symptoms.length ? `${snippet}…` : snippet;

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhaseIndex((i) => (i < phases.length - 1 ? i + 1 : i));
    }, 1400);
    return () => clearInterval(phaseTimer);
  }, []);

  useEffect(() => {
    setTyped(0);
    const t = setInterval(() => {
      setTyped((n) => (n < displaySnippet.length ? n + 1 : n));
    }, 18);
    return () => clearInterval(t);
  }, [displaySnippet]);

  const phase = phases[phaseIndex];

  return (
    <Card variant="gradient" className="overflow-hidden">
      <div className="border-b border-white/20 px-5 py-4 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            AI Medical Assistant
          </span>
          <span className="rounded-full glass px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
            Analyzing
          </span>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <motion.span
            className="gradient-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.2 }}
          >
            <Brain className="h-7 w-7 text-primary" />
          </motion.span>
          <section className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">
              Building your health insight report
            </p>
            <p className="mt-1 font-mono text-sm leading-relaxed text-muted">
              &ldquo;{displaySnippet.slice(0, typed)}
              <span className="animate-pulse text-primary">|</span>&rdquo;
            </p>
          </section>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Analysis progress</span>
            <span className="font-semibold text-primary">{progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-border/80">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                {phase.label}
              </span>
              <Loader2 className="ml-auto h-4 w-4 animate-spin text-primary" />
            </div>
            <p className="mt-1 text-xs text-muted">{phase.detail}</p>
          </motion.div>
        </AnimatePresence>

        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { label: "Age", value: String(request.age) },
            { label: "Duration", value: request.duration },
            { label: "Severity", value: request.severity },
            { label: "Gender", value: request.gender },
          ].map((item) => (
            <li
              key={item.label}
              className="rounded-lg glass px-3 py-2 text-xs"
            >
              <span className="text-muted">{item.label}</span>
              <p className="font-medium capitalize text-foreground">{item.value}</p>
            </li>
          ))}
        </ul>

        <div className="flex gap-1">
          {phases.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                i <= phaseIndex ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
