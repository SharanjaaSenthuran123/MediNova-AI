"use client";

import { motion } from "framer-motion";
import { Moon, Stars } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { useLiveHealth } from "@/hooks/useLiveHealthData";
import { useCountUp } from "@/hooks/useCountUp";

export function SleepQualityCard() {
  const { sleepQuality } = useLiveHealth();
  const score = useCountUp(sleepQuality.score, 1400);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <Card variant="elevated" className="h-full border-secondary/20 hover:shadow-[0_0_40px_rgb(37_99_235_/_0.2)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="h-4 w-4 text-secondary" />
            Sleep Quality
          </CardTitle>
          <CardDescription>Last night · {sleepQuality.qualityLabel}</CardDescription>
        </CardHeader>

        <section className="flex items-center gap-5">
          <ProgressRing
            value={sleepQuality.score}
            size={88}
            label={`${score}%`}
            colorClass="stroke-secondary"
          />
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between gap-4">
              <span className="text-muted">Deep sleep</span>
              <span className="font-medium">{sleepQuality.deepSleepHours}h</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-muted">REM</span>
              <span className="font-medium">{sleepQuality.remHours}h</span>
            </li>
            <li>
              <Badge variant="default" className="mt-1">
                <Stars className="mr-1 inline h-3 w-3" />
                Improving
              </Badge>
            </li>
          </ul>
        </section>
      </Card>
    </motion.div>
  );
}
