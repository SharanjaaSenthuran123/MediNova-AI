"use client";

import { LiveHealthProvider } from "@/hooks/useLiveHealthData";
import { ActivityTimelineCard } from "@/components/dashboard/ActivityTimelineCard";
import { AIHealthInsightCard } from "@/components/dashboard/AIHealthInsightCard";
import { AIRiskScoreCard } from "@/components/dashboard/AIRiskScoreCard";
import { DashboardQuickLinks } from "@/components/dashboard/DashboardQuickLinks";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { EmergencyStatusWidget } from "@/components/dashboard/EmergencyStatusWidget";
import { HealthTrendsSection } from "@/components/dashboard/HealthTrendsSection";
import { HydrationCard } from "@/components/dashboard/HydrationCard";
import { LiveECGCard } from "@/components/dashboard/LiveECGCard";
import { MedicineReminderWidget } from "@/components/dashboard/MedicineReminderWidget";
import { MedicineScheduleCard } from "@/components/dashboard/MedicineScheduleCard";
import { MedicineTimelineCard } from "@/components/dashboard/MedicineTimelineCard";
import { PatientSummaryCard } from "@/components/dashboard/PatientSummaryCard";
import { RecentReportsCard } from "@/components/dashboard/RecentReportsCard";
import { SleepQualityCard } from "@/components/dashboard/SleepQualityCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Activity } from "lucide-react";

export function DashboardClient() {
  return (
    <LiveHealthProvider>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="success" className="gap-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live production data
        </Badge>
        <span className="text-xs text-muted">
          Connected to MongoDB · real-time via Socket.IO
        </span>
      </div>

      <PatientSummaryCard />

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <AIRiskScoreCard />
        <SleepQualityCard />
        <HydrationCard />
      </section>

      <DashboardStatsGrid />

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MedicineReminderWidget />
        <EmergencyStatusWidget />
        <ActivityTimelineCard />
      </section>

      <DashboardQuickLinks />

      <SectionHeading title="Live monitoring" className="mb-4" />
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <LiveECGCard />
        <AIHealthInsightCard />
      </section>

      <HealthTrendsSection />

      <SectionHeading title="Today & reports" className="mb-4" />

      <section className="mb-6 grid gap-6 lg:grid-cols-3">
        <MedicineScheduleCard />
        <MedicineTimelineCard />
        <RecentReportsCard />
      </section>
    </LiveHealthProvider>
  );
}
