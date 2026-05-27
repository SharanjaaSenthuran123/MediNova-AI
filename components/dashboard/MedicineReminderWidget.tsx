"use client";

import { motion } from "framer-motion";
import { Bell, Clock, Pill } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getNextMedicineReminder, medicineSchedule } from "@/data/dashboardStats";

export function MedicineReminderWidget() {
  const next = getNextMedicineReminder();
  const pending = medicineSchedule.filter((m) => !m.taken);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <Card
        variant="elevated"
        className="h-full border-warning/20 hover:shadow-[0_0_36px_rgb(245_158_11_/_0.18)]"
      >
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <section>
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-warning" />
              Medicine Reminder
            </CardTitle>
            <CardDescription>
              {pending.length === 0
                ? "All doses taken today"
                : `${pending.length} dose${pending.length !== 1 ? "s" : ""} remaining today`}
            </CardDescription>
          </section>
          {next && (
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning/70 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-warning" />
            </span>
          )}
        </CardHeader>

        {next ? (
          <section className="rounded-xl glass px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <section>
                <p className="font-semibold">{next.name}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  {next.time}
                </p>
              </section>
              <Badge variant="warning">Due soon</Badge>
            </div>
          </section>
        ) : (
          <section className="rounded-xl glass px-4 py-3 text-sm text-muted">
            Great job — today&apos;s schedule is complete.
          </section>
        )}

        <Link href="/reminders" className="mt-4 inline-block">
          <Button size="sm" variant="outline" className="w-full">
            <Bell className="h-4 w-4" />
            View all reminders
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}
