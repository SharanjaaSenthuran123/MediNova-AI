"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { getRiskLabel } from "@/data/dashboardStats";
import { useLiveHealth } from "@/hooks/useLiveHealthData";
import { useCountUp } from "@/hooks/useCountUp";

export function AIRiskScoreCard() {
  const { aiRisk: aiRiskMetrics } = useLiveHealth();
  const risk = getRiskLabel(aiRiskMetrics.score);
  const display = useCountUp(aiRiskMetrics.score, 1500);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        variant="gradient"
        className="relative h-full overflow-hidden border-primary/25 shadow-glow"
      >
        <div
          className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl animate-glow"
          aria-hidden
        />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-primary" />
            AI Risk Score
          </CardTitle>
          <CardDescription>{aiRiskMetrics.lastUpdated}</CardDescription>
        </CardHeader>

        <section className="relative flex items-center gap-6">
          <ProgressRing
            value={100 - aiRiskMetrics.score}
            max={100}
            size={96}
            strokeWidth={7}
            label={String(display)}
            sublabel="risk"
            colorClass="stroke-success"
          />
          <section className="min-w-0 flex-1">
            <Badge variant={risk.variant} className="mb-2">
              {risk.label}
            </Badge>
            <p className="flex items-center gap-1 text-xs text-success">
              <TrendingDown className="h-3 w-3" />
              {aiRiskMetrics.trend}
            </p>
            <ul className="mt-3 space-y-1">
              {aiRiskMetrics.factors.map((factor) => (
                <li
                  key={factor}
                  className="flex items-center gap-1.5 text-xs text-muted"
                >
                  <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                  {factor}
                </li>
              ))}
            </ul>
          </section>
        </section>
      </Card>
    </motion.div>
  );
}
