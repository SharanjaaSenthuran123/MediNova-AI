"use client";

import { LiveStatCard } from "@/components/dashboard/LiveStatCard";
import { useLiveHealth } from "@/hooks/useLiveHealthData";

export function DashboardStatsGrid() {
  const { healthStats } = useLiveHealth();

  return (
    <ul className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {healthStats.map((stat, index) => (
        <LiveStatCard key={stat.id} stat={stat} index={index} />
      ))}
    </ul>
  );
}
