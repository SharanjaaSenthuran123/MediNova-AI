"use client";

import {
  FileText,
  LayoutDashboard,
  Siren,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { AnimatedCounter } from "@/components/homepage/AnimatedCounter";
import { trustStripItems } from "@/data/homepageFeatures";
import { trustStats } from "@/data/dashboardStats";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  FileText,
  Siren,
  LayoutDashboard,
};

/** Parse numeric prefix from trust stat values like "24/7" or "99%". */
function parseStatValue(value: string): {
  numeric: number;
  suffix: string;
} {
  const match = value.match(/^(\d+)(.*)$/);
  if (match) return { numeric: parseInt(match[1], 10), suffix: match[2] };
  return { numeric: 0, suffix: value };
}

export function TrustStrip() {
  return (
    <section className="border-b border-white/20 py-12 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustStripItems.map((item, index) => {
            const Icon = iconMap[item.icon] ?? Sparkles;
            const stat = trustStats[index];
            const parsed = parseStatValue(stat.value);
            const isNumeric = parsed.numeric > 0;

            return (
              <li
                key={item.label}
                className={cn(
                  "glass flex items-start gap-4 rounded-2xl p-5",
                  "transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow-lg"
                )}
              >
                <span className="gradient-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-gradient">
                    {isNumeric ? (
                      <AnimatedCounter
                        end={parsed.numeric}
                        suffix={parsed.suffix}
                      />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
