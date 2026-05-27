"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { TypingText } from "@/components/ui/TypingText";
import { aiHealthInsight } from "@/data/chartData";
import { useLiveHealth } from "@/hooks/useLiveHealthData";

export function AIHealthInsightCard() {
  const { healthStats, aiRisk } = useLiveHealth();
  const [insight, setInsight] = useState(aiHealthInsight);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    const hr = healthStats.find((s) => s.id === "heart-rate")?.numericValue;
    const sleep = healthStats.find((s) => s.id === "sleep")?.numericValue;
    const adherence = healthStats.find((s) => s.id === "medicine")?.numericValue;
    const hydration = healthStats.find((s) => s.id === "hydration")?.numericValue;

    let cancelled = false;

    async function fetchInsight() {
      try {
        const res = await fetch("/api/dashboard-insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            heartRate: hr,
            sleep,
            adherence,
            hydration,
            riskScore: aiRisk.score,
          }),
        });
        if (!res.ok) throw new Error("Failed");
        const data = (await res.json()) as {
          insight: string;
          demoMode?: boolean;
        };
        if (!cancelled) {
          setInsight(data.insight);
          setDemoMode(Boolean(data.demoMode));
        }
      } catch {
        if (!cancelled) {
          setInsight(aiHealthInsight);
          setDemoMode(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const debounce = setTimeout(() => void fetchInsight(), 600);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [healthStats, aiRisk.score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card
        variant="gradient"
        className="relative overflow-hidden border-primary/25 shadow-glow"
      >
        <div
          className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-primary/25 blur-2xl animate-glow"
          aria-hidden
        />
        <Badge variant={demoMode ? "warning" : "success"} className="relative mb-2 gap-1">
          <Sparkles className="h-3 w-3 animate-pulse" />
          {demoMode ? "Smart demo insight" : "Live AI insight"}
        </Badge>
        <div className="relative min-h-[4rem] text-sm leading-relaxed text-muted">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          ) : (
            <TypingText text={insight} speed={12} />
          )}
        </div>
        <Link href="/symptom-checker" className="relative mt-4 inline-block">
          <Button size="sm" variant="outline">
            Run Symptom Check
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}
