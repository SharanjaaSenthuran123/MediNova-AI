import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { HealthChart } from "@/components/dashboard/HealthChart";
import {
  healthStats,
  patientSummary,
  recentReports,
  medicineSchedule,
} from "@/data/dashboardStats";
import {
  heartRateWeek,
  sleepWeek,
  medicineAdherence,
  aiHealthInsight,
} from "@/data/chartData";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Health Overview"
        description="Monitor your vitals, medicines, and reports at a glance."
        action={
          <Link href="/symptom-checker">
            <Button size="sm">
              Symptom Check
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <section className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <User className="h-7 w-7" />
            </span>
            <section>
              <h2 className="text-lg font-semibold">{patientSummary.name}</h2>
              <p className="text-sm text-muted">
                Age {patientSummary.age} • Blood type {patientSummary.bloodType}{" "}
                • Last checkup {patientSummary.lastCheckup}
              </p>
            </section>
          </section>
          <section className="text-left sm:text-right">
            <p className="text-sm text-muted">Risk score</p>
            <p className="text-2xl font-bold text-success">
              {patientSummary.riskScore}
              <span className="text-sm font-normal text-muted"> / 100</span>
            </p>
            <Badge variant="success" className="mt-1">
              Low risk
            </Badge>
          </section>
        </section>
      </Card>

      <ul className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {healthStats.map((stat) => (
          <li key={stat.id}>
            <StatCard stat={stat} />
          </li>
        ))}
      </ul>

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <HealthChart
          title="Heart Rate (7 days)"
          description="Resting BPM trend"
          labels={heartRateWeek.labels}
          values={heartRateWeek.values}
          type="line"
          unit="bpm"
          color="#14b8a6"
        />
        <HealthChart
          title="Sleep (hours)"
          description="Nightly sleep duration"
          labels={sleepWeek.labels}
          values={sleepWeek.values}
          type="bar"
          unit="h"
          color="#2563eb"
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
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Today&apos;s Medicines</h3>
          <ul className="mt-4 space-y-3">
            {medicineSchedule.map((med) => (
              <li
                key={med.name}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <section>
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-muted">{med.time}</p>
                </section>
                <Badge variant={med.taken ? "success" : "warning"}>
                  {med.taken ? "Taken" : "Pending"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <section className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Reports</h3>
            <Link href="/reports" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </section>
          <ul className="mt-4 space-y-3">
            {recentReports.map((report) => (
              <li
                key={report.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <section>
                  <p className="font-medium">{report.title}</p>
                  <p className="text-sm text-muted">{report.date}</p>
                </section>
                <Badge
                  variant={
                    report.status === "Normal"
                      ? "success"
                      : report.status === "Review"
                        ? "warning"
                        : "outline"
                  }
                >
                  {report.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <Card className="mt-6 border-primary/20 bg-primary/5">
        <Badge variant="default" className="mb-2">
          AI Health Insight
        </Badge>
        <p className="text-sm text-muted">{aiHealthInsight}</p>
      </Card>
    </>
  );
}
