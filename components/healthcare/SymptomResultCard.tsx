"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { ConditionConfidenceList } from "@/components/healthcare/ConditionConfidenceList";
import { UrgencyIndicator } from "@/components/healthcare/UrgencyIndicator";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { TypingText } from "@/components/ui/TypingText";
import type { SymptomCheckResult } from "@/types/symptom";
import { cn } from "@/lib/utils";

interface SymptomResultCardProps {
  result: SymptomCheckResult;
  demoMode?: boolean;
  apiMessage?: string;
  onStartOver?: () => void;
}

export function SymptomResultCard({
  result,
  demoMode,
  apiMessage,
  onStartOver,
}: SymptomResultCardProps) {
  const showEmergencyCta =
    result.urgency === "emergency" || result.urgency === "high";
  const confidence = result.overallConfidence ?? 72;

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <section className="glass-strong flex flex-col gap-4 rounded-2xl border border-primary/20 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ProgressRing
            value={confidence}
            max={100}
            size={80}
            label={`${confidence}%`}
            sublabel="Confidence"
            colorClass="stroke-primary"
          />
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Analysis complete
            </p>
            <h2 className="text-xl font-bold text-foreground">
              AI Medical Assistant Report
            </h2>
            <Badge
              variant={demoMode ? "warning" : "success"}
              className="mt-2 gap-1"
            >
              <Sparkles className="h-3 w-3" />
              {demoMode ? "Demo analysis" : "Live AI"}
            </Badge>
          </section>
        </div>
        {onStartOver && (
          <Button variant="outline" size="sm" onClick={onStartOver}>
            <RotateCcw className="h-4 w-4" />
            New check
          </Button>
        )}
      </section>

      {(demoMode || apiMessage) && (
        <p className="rounded-xl glass border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
          {demoMode && <span className="font-medium">Demo mode: </span>}
          {apiMessage ??
            "Add OPENAI_API_KEY to .env.local for live AI analysis."}
        </p>
      )}

      <UrgencyIndicator
        urgency={result.urgency}
        urgencyScore={result.urgencyScore}
      />

      {showEmergencyCta && (
        <Link href="/emergency">
          <Button variant="danger" className="w-full sm:w-auto">
            Open Emergency SOS
          </Button>
        </Link>
      )}

      <ConditionConfidenceList result={result} />

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-primary" />
            Care suggestions
          </CardTitle>
          <CardDescription>Self-care and monitoring guidance</CardDescription>
        </CardHeader>
        <ul className="space-y-2">
          {result.suggestions.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex gap-3 rounded-xl glass px-3 py-2.5 text-sm text-foreground"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">
                {i + 1}
              </span>
              {i === 0 ? <TypingText text={item} speed={14} /> : item}
            </motion.li>
          ))}
        </ul>
      </Card>

      <Card
        variant="glass"
        className={cn("border-warning/25")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-5 w-5 text-warning" />
            When to seek medical care
          </CardTitle>
          <CardDescription>Warning signs requiring professional help</CardDescription>
        </CardHeader>
        <ul className="space-y-2">
          {result.seekDoctorIf.map((item) => (
            <li
              key={item}
              className="flex gap-2 rounded-xl border border-warning/20 bg-warning/5 px-3 py-2.5 text-sm"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <p className="rounded-xl glass px-4 py-3 text-xs leading-relaxed text-muted">
        <TypingText text={result.disclaimer} speed={10} />
      </p>

      <Link href="/assistant">
        <Button variant="glass" className="w-full">
          <MessageSquare className="h-4 w-4" />
          Ask follow-up questions in AI Assistant
        </Button>
      </Link>
    </motion.div>
  );
}
