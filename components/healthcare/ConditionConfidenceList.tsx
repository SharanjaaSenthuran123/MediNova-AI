"use client";

import { motion } from "framer-motion";
import { Microscope } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getConditionMatches } from "@/lib/symptom-utils";
import type { SymptomCheckResult } from "@/types/symptom";
import { cn } from "@/lib/utils";

function confidenceLabel(score: number): string {
  if (score >= 75) return "Strong match";
  if (score >= 55) return "Moderate match";
  return "Possible match";
}

function confidenceColor(score: number): string {
  if (score >= 75) return "bg-primary";
  if (score >= 55) return "bg-accent";
  return "bg-secondary/80";
}

interface ConditionConfidenceListProps {
  result: SymptomCheckResult;
}

export function ConditionConfidenceList({ result }: ConditionConfidenceListProps) {
  const conditions = getConditionMatches(result);

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Microscope className="h-5 w-5 text-primary" />
          Possible conditions
        </CardTitle>
        <CardDescription>
          Educational matches with AI confidence — not a diagnosis
        </CardDescription>
      </CardHeader>

      <ol className="space-y-3">
        {conditions.map((item, index) => (
          <motion.li
            key={item.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <section>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted">
                    {confidenceLabel(item.confidence)}
                  </p>
                </section>
              </div>
              <span className="text-lg font-bold tabular-nums text-primary">
                {item.confidence}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-border/80">
              <motion.div
                className={cn("h-full rounded-full", confidenceColor(item.confidence))}
                initial={{ width: 0 }}
                animate={{ width: `${item.confidence}%` }}
                transition={{ delay: 0.15 + index * 0.08, duration: 0.6 }}
              />
            </div>
          </motion.li>
        ))}
      </ol>
    </Card>
  );
}
