"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { apiFetch } from "@/lib/api/client";

interface ReminderRow {
  id: string;
  medicineName: string;
  time: string;
  takenToday?: boolean;
  enabled: boolean;
}

export function MedicineScheduleCard() {
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{ reminders: ReminderRow[] }>("/api/reminders");
        setReminders(res.reminders.filter((r) => r.enabled));
      } catch {
        setReminders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const takenCount = reminders.filter((m) => m.takenToday).length;

  return (
    <Card className="h-full">
      <section className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Today&apos;s Medicines</h3>
        <Badge variant="outline">
          {loading ? "…" : `${takenCount}/${reminders.length || 0} taken`}
        </Badge>
      </section>
      {loading ? (
        <div className="mt-6 flex justify-center">
          <LoadingSpinner size="sm" />
        </div>
      ) : reminders.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No active reminders. Add medicines from the Reminders page.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {reminders.map((med) => (
            <li
              key={med.id}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
            >
              <section>
                <p className="font-medium">{med.medicineName}</p>
                <p className="text-sm text-muted">{med.time}</p>
              </section>
              <Badge variant={med.takenToday ? "success" : "warning"}>
                {med.takenToday ? "Taken" : "Pending"}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
