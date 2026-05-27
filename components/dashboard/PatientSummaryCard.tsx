"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { apiFetch } from "@/lib/api/client";

interface DashboardProfile {
  profile: {
    name: string;
    bloodType?: string;
    conditions: string[];
  } | null;
  stats: {
    orders: number;
    appointments: number;
    symptomChecks: number;
    activeReminders: number;
  };
}

export function PatientSummaryCard() {
  const [data, setData] = useState<DashboardProfile | null>(null);

  useEffect(() => {
    apiFetch<DashboardProfile>("/api/dashboard")
      .then(setData)
      .catch(() => undefined);
  }, []);

  if (!data?.profile) {
    return (
      <Card className="mb-6 flex min-h-[120px] items-center justify-center">
        <LoadingSpinner />
      </Card>
    );
  }

  const { profile, stats } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card variant="gradient" className="relative mb-6 overflow-hidden border-primary/20 shadow-glow-lg">
        <section className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <section>
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="mt-1 text-sm text-muted">
              Blood type {profile.bloodType ?? "—"} · {profile.conditions.join(", ") || "No conditions logged"}
            </p>
          </section>
          <section className="flex flex-wrap gap-2">
            <Badge variant="secondary">{stats.orders} orders</Badge>
            <Badge variant="secondary">{stats.appointments} appointments</Badge>
            <Badge variant="success">{stats.activeReminders} reminders</Badge>
          </section>
        </section>
      </Card>
    </motion.div>
  );
}
