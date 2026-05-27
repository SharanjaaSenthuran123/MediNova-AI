"use client";

import { HealthChart } from "@/components/dashboard/HealthChart";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLiveHealth } from "@/hooks/useLiveHealthData";

export function HealthTrendsSection() {
  const { chartData } = useLiveHealth();
  const { heartRateWeek, sleepWeek, medicineAdherence } = chartData;

  return (
    <>
      <SectionHeading
        title="Analytics trends"
        description="Animated Chart.js vitals with live-style updates every few seconds."
        className="mb-4"
      />

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <HealthChart
          title="Heart Rate (7 days)"
          description="Resting BPM · live-style trend"
          labels={heartRateWeek.labels}
          values={heartRateWeek.values}
          type="line"
          unit="bpm"
          color="#14b8a6"
          delay={0}
          liveKey={heartRateWeek.values.join("-")}
        />
        <HealthChart
          title="Sleep (hours)"
          description="Nightly sleep duration"
          labels={sleepWeek.labels}
          values={sleepWeek.values}
          type="bar"
          unit="h"
          color="#2563eb"
          delay={0.08}
          liveKey={sleepWeek.values.join("-")}
        />
      </section>

      <section className="mb-6">
        <HealthChart
          title="Medicine Adherence"
          description="Weekly adherence percentage"
          labels={medicineAdherence.labels}
          values={medicineAdherence.values}
          type="bar"
          unit="%"
          color="#22c55e"
          delay={0.12}
          liveKey={medicineAdherence.values.join("-")}
        />
      </section>
    </>
  );
}
