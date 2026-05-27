"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Droplets,
  HeartPulse,
  Moon,
  Pill,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useCountUp } from "@/hooks/useCountUp";
import type { HealthStat } from "@/types/health";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  HeartPulse,
  Moon,
  Pill,
  Activity,
  Droplets,
};

const statusVariant = {
  normal: "success" as const,
  improving: "default" as const,
  attention: "warning" as const,
  critical: "danger" as const,
};

const statusLabel = {
  normal: "Normal",
  improving: "Improving",
  attention: "Needs attention",
  critical: "Critical",
};

const glowMap: Record<string, string> = {
  "heart-rate": "hover:shadow-[0_0_40px_rgb(239_68_68_/_0.25)]",
  sleep: "hover:shadow-[0_0_40px_rgb(37_99_235_/_0.25)]",
  medicine: "hover:shadow-[0_0_40px_rgb(34_197_94_/_0.25)]",
  risk: "hover:shadow-[0_0_40px_rgb(20_184_166_/_0.25)]",
  hydration: "hover:shadow-[0_0_40px_rgb(6_182_212_/_0.25)]",
};

interface LiveStatCardProps {
  stat: HealthStat;
  index?: number;
  className?: string;
}

export function LiveStatCard({ stat, index = 0, className }: LiveStatCardProps) {
  const Icon = iconMap[stat.icon] ?? Activity;
  const numeric = stat.numericValue ?? (parseFloat(stat.value) || 0);
  const display = useCountUp(numeric, 1400, stat.decimals ?? 0);
  const isHeart = stat.id === "heart-rate";

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className={className}
    >
      <Card
        variant="elevated"
        interactive
        className={cn(
          "group relative overflow-hidden border-primary/10",
          glowMap[stat.id] ?? "hover:shadow-glow",
          "transition-shadow duration-500"
        )}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-60"
          aria-hidden
        />
        <section className="relative flex items-start justify-between">
          <span
            className={cn(
              "gradient-icon flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
              isHeart && "animate-heart-pulse"
            )}
          >
            <Icon className={cn("h-5 w-5", isHeart && "text-danger")} />
          </span>
          <Badge variant={statusVariant[stat.status]}>{statusLabel[stat.status]}</Badge>
        </section>
        <p className="relative mt-4 text-sm text-muted">{stat.label}</p>
        <p className="relative mt-1 text-3xl font-bold tabular-nums text-foreground">
          {display}
          {stat.unit && (
            <span className="ml-1 text-lg font-medium text-muted">{stat.unit}</span>
          )}
        </p>
        {stat.change && (
          <p className="relative mt-2 text-xs text-muted">{stat.change}</p>
        )}
        {isHeart && (
          <span className="absolute bottom-3 right-3 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger/60 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
          </span>
        )}
      </Card>
    </motion.li>
  );
}
