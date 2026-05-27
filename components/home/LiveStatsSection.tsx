"use client";

import { motion } from "framer-motion";
import {
  Ambulance,
  Brain,
  Calendar,
  Users,
  type LucideIcon,
} from "lucide-react";
import { liveHealthStats } from "@/data/healthcareEntities";
import { Card } from "@/components/ui/Card";

const iconMap: Record<string, LucideIcon> = {
  Users,
  Calendar,
  Brain,
  Ambulance,
};

export function LiveStatsSection() {
  return (
    <section className="border-b border-white/20 bg-primary/5 py-12 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Live Health Statistics
          </h2>
          <p className="mt-2 text-muted">Real-time ecosystem metrics</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {liveHealthStats.map((stat, i) => {
            const Icon = iconMap[stat.icon] ?? Users;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card variant="elevated" interactive className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-icon">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm font-medium text-foreground">{stat.label}</p>
                  <p className="mt-1 text-xs text-success">{stat.change}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
