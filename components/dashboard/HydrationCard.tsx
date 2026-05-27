"use client";

import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { useLiveHealth } from "@/hooks/useLiveHealthData";
import { useCountUp } from "@/hooks/useCountUp";

export function HydrationCard() {
  const { hydration: hydrationMetrics } = useLiveHealth();
  const pct = Math.round(
    (hydrationMetrics.currentMl / hydrationMetrics.goalMl) * 100
  );
  const displayPct = useCountUp(pct, 1200);
  const liters = useCountUp(
    hydrationMetrics.currentMl / 1000,
    1200,
    1
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card variant="elevated" className="h-full border-accent/20 hover:shadow-[0_0_40px_rgb(6_182_212_/_0.22)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Droplets className="h-4 w-4 text-accent" />
            Hydration Tracking
          </CardTitle>
          <CardDescription>
            {hydrationMetrics.glasses}/{hydrationMetrics.goalGlasses} glasses today
          </CardDescription>
        </CardHeader>

        <section className="flex items-center gap-5">
          <ProgressRing
            value={pct}
            size={88}
            label={`${displayPct}%`}
            colorClass="stroke-accent"
          />
          <section>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {liters}
              <span className="ml-1 text-base font-medium text-muted">L</span>
            </p>
            <p className="text-xs text-muted">
              Goal {(hydrationMetrics.goalMl / 1000).toFixed(1)}L
            </p>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: hydrationMetrics.goalGlasses }).map((_, i) => (
                <span
                  key={i}
                  className={`h-6 w-2 rounded-full transition-colors ${
                    i < hydrationMetrics.glasses
                      ? "bg-accent shadow-[0_0_8px_rgb(6_182_212_/_0.5)]"
                      : "bg-border"
                  }`}
                  aria-hidden
                />
              ))}
            </div>
          </section>
        </section>
      </Card>
    </motion.div>
  );
}
