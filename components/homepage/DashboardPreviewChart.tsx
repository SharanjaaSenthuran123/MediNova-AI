"use client";

import { HealthChart } from "@/components/dashboard/HealthChart";
import { heartRateWeek } from "@/data/chartData";

/** Compact chart for the homepage dashboard preview. */
export function DashboardPreviewChart() {
  return (
    <HealthChart
      title="Heart rate trend"
      description="7-day mock vitals from the dashboard"
      labels={heartRateWeek.labels}
      values={heartRateWeek.values}
      type="line"
      unit=" bpm"
    />
  );
}
