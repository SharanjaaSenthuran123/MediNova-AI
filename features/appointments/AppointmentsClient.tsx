"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { AppointmentEntry } from "@/types/integrations";

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "11:00",
  "14:00",
  "15:30",
  "16:00",
];

const SPECIALTIES = [
  "Primary care",
  "Internal medicine",
  "Pediatrics",
  "Dermatology",
  "Cardiology",
];

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
}

export function AppointmentsClient() {
  const [appointments, setAppointments] = useState<AppointmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [providerName, setProviderName] = useState("Dr. Sarah Chen");
  const [specialty, setSpecialty] = useState("Primary care");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState<"virtual" | "in-person">("virtual");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, apptRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/appointments"),
      ]);
      const userData = (await userRes.json()) as { user: unknown };
      setHasProfile(Boolean(userData.user));

      const data = (await apptRes.json()) as {
        appointments: AppointmentEntry[];
      };
      setAppointments(data.appointments ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleBook(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName,
          specialty,
          date,
          time,
          type,
          notes: notes.trim() || undefined,
        }),
      });
      if (res.ok) {
        setNotes("");
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(
    id: string,
    status: "scheduled" | "completed" | "cancelled"
  ) {
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
  }

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <LoadingSpinner />
        <span className="ml-2 text-sm text-muted">Loading appointments...</span>
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={Calendar}
          title="Create a profile to book appointments"
          description="Demo booking UI with prep checklists — no real calendar integration."
        />
        <div className="flex justify-center">
          <Link href="/profile">
            <Button>Create profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  const upcoming = appointments.filter((a) => a.status === "scheduled");

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Card>
        <h2 className="text-lg font-semibold">Book appointment</h2>
        <p className="mt-1 text-sm text-muted">
          Demo scheduling — connects to clinic APIs in production.
        </p>

        <form onSubmit={handleBook} className="mt-4 space-y-4">
          <Input
            label="Provider"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            required
          />
          <Select
            label="Specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Select
              label="Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <Select
            label="Visit type"
            value={type}
            onChange={(e) =>
              setType(e.target.value as "virtual" | "in-person")
            }
          >
            <option value="virtual">Remote follow-up</option>
            <option value="in-person">In-person clinic visit</option>
          </Select>
          <Input
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Follow-up on recent symptom check"
          />
          <Button type="submit" disabled={saving}>
            {saving ? <LoadingSpinner size="sm" /> : <Calendar className="h-4 w-4" />}
            Book appointment
          </Button>
        </form>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Upcoming ({upcoming.length})
        </h2>

        {appointments.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No appointments booked"
            description="Pick a provider, date, and time to schedule your first demo visit."
          />
        ) : (
          <ul className="space-y-3">
            {appointments.map((appt) => (
              <li key={appt.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{appt.providerName}</p>
                      <p className="text-sm text-muted">{appt.specialty}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        {appt.date} at {appt.time}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                        {appt.type === "virtual" ? (
                          <>
                            <MessageSquare className="h-3.5 w-3.5" /> Remote follow-up
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5" /> In-person
                          </>
                        )}
                      </p>
                    </div>
                    <Badge
                      variant={
                        appt.status === "scheduled"
                          ? "default"
                          : appt.status === "completed"
                            ? "success"
                            : "outline"
                      }
                    >
                      {appt.status}
                    </Badge>
                  </div>

                  {appt.notes && (
                    <p className="mt-2 text-sm text-muted">{appt.notes}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setExpandedId(expandedId === appt.id ? null : appt.id)
                      }
                    >
                      Prep checklist
                    </Button>
                    {appt.status === "scheduled" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void updateStatus(appt.id, "completed")}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Complete
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void updateStatus(appt.id, "cancelled")}
                        >
                          <XCircle className="h-4 w-4 text-danger" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>

                  {expandedId === appt.id && (
                    <ul className="mt-3 space-y-1 rounded-lg border border-border bg-muted/5 p-3">
                      {appt.prepChecklist.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-xs text-muted before:text-primary before:content-['✓']"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
