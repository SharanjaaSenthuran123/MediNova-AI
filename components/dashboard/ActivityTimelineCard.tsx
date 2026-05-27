"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  FileText,
  Sparkles,
  Siren,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { activityTimeline } from "@/data/dashboardStats";
import { cn } from "@/lib/utils";

const typeStyles = {
  vitals: { icon: Activity, color: "text-primary bg-primary/10" },
  medicine: { icon: Bell, color: "text-warning bg-warning/10" },
  ai: { icon: Sparkles, color: "text-secondary bg-secondary/10" },
  emergency: { icon: Siren, color: "text-danger bg-danger/10" },
  report: { icon: FileText, color: "text-accent bg-accent/10" },
};

export function ActivityTimelineCard() {
  return (
    <Card variant="elevated" className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Activity Timeline</CardTitle>
      </CardHeader>

      <ul className="relative space-y-0 pl-1">
        <div
          className="absolute bottom-2 left-[15px] top-2 w-px bg-gradient-to-b from-primary/40 via-secondary/30 to-transparent"
          aria-hidden
        />
        {activityTimeline.map((item, i) => {
          const { icon: Icon, color } = typeStyles[item.type];
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="relative flex gap-3 pb-4 last:pb-0"
            >
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  color
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <section className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <time className="text-[10px] uppercase tracking-wide text-muted">
                    {item.time}
                  </time>
                </div>
                <p className="mt-0.5 text-xs text-muted">{item.description}</p>
              </section>
            </motion.li>
          );
        })}
      </ul>
    </Card>
  );
}
