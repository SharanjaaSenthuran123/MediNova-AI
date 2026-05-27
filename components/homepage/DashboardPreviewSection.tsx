import {
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardMockup } from "@/components/homepage/DashboardMockup";
import { DashboardPreviewChart } from "@/components/homepage/DashboardPreviewChart";
import { LiveAIAnalysis } from "@/components/homepage/LiveAIAnalysis";
import { TrustBadges } from "@/components/homepage/TrustBadges";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { aiHealthInsight } from "@/data/chartData";
import { healthStats } from "@/data/dashboardStats";

export function DashboardPreviewSection() {
  return (
    <section className="relative border-y border-white/20 py-24 dark:border-white/10">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-fade-in-up">
            <Badge variant="glass" className="mb-4">
              Dashboard preview
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-gradient">Your health control center</span>
            </h2>
            <p className="mt-4 text-lg text-muted">
              A polished dashboard mockup with live-style AI analysis, Chart.js
              vitals, and trust badges — everything judges expect from a modern
              healthcare startup.
            </p>

            <TrustBadges className="mt-6" compact />

            <ul className="mt-8 space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 shrink-0 text-primary" />
                Real-time style health metrics with believable mock data
              </li>
              <li className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 shrink-0 text-primary" />
                Linked to AI Symptom Checker insights
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                Privacy-first demo design with clear disclaimers
              </li>
            </ul>
            <ButtonLink href="/dashboard" className="mt-8" size="lg">
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>

          <div className="animate-fade-in-up space-y-4" style={{ animationDelay: "0.1s" }}>
            <DashboardMockup>
              <ul className="grid gap-4 sm:grid-cols-2">
                {healthStats.map((stat) => (
                  <li key={stat.id}>
                    <StatCard stat={stat} />
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <DashboardPreviewChart />
              </div>
              <Card variant="gradient" className="mt-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Latest AI insight
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {aiHealthInsight}
                </p>
              </Card>
            </DashboardMockup>
            <LiveAIAnalysis />
          </div>
        </div>
      </div>
    </section>
  );
}
