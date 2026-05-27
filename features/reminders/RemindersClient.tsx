"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, BellOff, Mail, Plus, Smartphone, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { ReminderEntry } from "@/types/integrations";
import type { ReminderSuggestion } from "@/lib/reminder-suggestions";

const scheduleLabels: Record<string, string> = {
  morning: "8:00 AM",
  afternoon: "1:00 PM",
  evening: "6:00 PM",
  bedtime: "9:30 PM",
  custom: "Custom",
};

export function RemindersClient() {
  const [reminders, setReminders] = useState<ReminderEntry[]>([]);
  const [suggestions, setSuggestions] = useState<ReminderSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [schedule, setSchedule] = useState("morning");
  const [channel, setChannel] = useState("push");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, remRes] = await Promise.all([
        fetch("/api/user", { credentials: "include", cache: "no-store" }),
        fetch("/api/reminders", { credentials: "include", cache: "no-store" }),
      ]);
      const userData = (await userRes.json()) as { user: unknown };
      setHasProfile(Boolean(userData.user));

      if (remRes.status === 401) {
        setHasProfile(false);
        return;
      }

      const data = (await remRes.json()) as {
        reminders: ReminderEntry[];
        suggestions: ReminderSuggestion[];
        error?: string;
      };
      setReminders(data.reminders ?? []);
      setSuggestions(data.suggestions ?? []);
    } catch {
      toast.error("Could not load reminders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!medicineName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineName: medicineName.trim(),
          dosage: dosage.trim() || undefined,
          schedule,
          channel,
          source: "manual",
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) {
        setMedicineName("");
        setDosage("");
        toast.success("Reminder added");
        await load();
      } else {
        toast.error(data.error ?? "Could not add reminder — sign in and try again");
      }
    } catch {
      toast.error("Could not add reminder");
    } finally {
      setSaving(false);
    }
  }

  async function addFromSuggestion(name: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromSuggestion: { medicineName: name } }),
      });
      if (res.ok) {
        toast.success("Reminder added from suggestion");
        await load();
      } else {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Could not add reminder");
      }
    } catch {
      toast.error("Could not add reminder");
    } finally {
      setSaving(false);
    }
  }

  async function toggleReminder(id: string, enabled: boolean) {
    await fetch("/api/reminders", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled: !enabled }),
    });
    await load();
  }

  async function simulateNotify(id: string) {
    await fetch("/api/reminders", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, lastNotifiedAt: new Date().toISOString() }),
    });
    await load();
  }

  async function deleteReminder(id: string) {
    await fetch(`/api/reminders?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    await load();
  }

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <LoadingSpinner />
        <span className="ml-2 text-sm text-muted">Loading reminders...</span>
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={Bell}
          title="Sign in to use reminders"
          description="Log in to create medicine reminders linked to your prescriptions and scan history."
        />
        <div className="flex justify-center">
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Card>
        <h2 className="text-lg font-semibold">Add reminder</h2>
        <p className="mt-1 text-sm text-muted">
          Push and email alerts are simulated in this demo.
        </p>

        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <Input
            label="Medicine name"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            placeholder="Amoxicillin"
            required
          />
          <Input
            label="Dosage (optional)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="500mg twice daily"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="bedtime">Bedtime</option>
            </Select>
            <Select
              label="Channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="push">Push notification</option>
              <option value="email">Email</option>
              <option value="both">Both</option>
            </Select>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? <LoadingSpinner size="sm" /> : <Plus className="h-4 w-4" />}
            Add reminder
          </Button>
        </form>

        {suggestions.length > 0 && (
          <section className="mt-6 border-t border-border pt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              Suggested from history
            </h3>
            <ul className="mt-3 space-y-2">
              {suggestions.map((s) => (
                <li
                  key={`${s.source}-${s.medicineName}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{s.medicineName}</p>
                    <p className="text-xs text-muted">{s.label}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void addFromSuggestion(s.medicineName)}
                    disabled={saving}
                  >
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Your reminders ({reminders.length})
        </h2>

        {reminders.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="No reminders yet"
            description="Scan a prescription or barcode first to get smart suggestions, or add one manually."
          />
        ) : (
          <ul className="space-y-3">
            {reminders.map((r) => (
              <li key={r.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{r.medicineName}</p>
                      {r.dosage && (
                        <p className="text-sm text-muted">{r.dosage}</p>
                      )}
                      <p className="mt-1 text-xs text-muted">
                        {scheduleLabels[r.schedule] ?? r.schedule} ·{" "}
                        {r.channel === "both" ? "Push + email" : r.channel}
                      </p>
                    </div>
                    <Badge variant={r.enabled ? "success" : "outline"}>
                      {r.enabled ? "Active" : "Paused"}
                    </Badge>
                  </div>

                  {r.lastNotifiedAt && (
                    <p className="mt-2 text-xs text-success">
                      Last simulated alert:{" "}
                      {new Date(r.lastNotifiedAt).toLocaleString()}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void simulateNotify(r.id)}
                    >
                      {r.channel === "email" ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <Smartphone className="h-4 w-4" />
                      )}
                      Simulate alert
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void toggleReminder(r.id, r.enabled)}
                    >
                      {r.enabled ? "Pause" : "Enable"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void deleteReminder(r.id)}
                      aria-label={`Delete reminder for ${r.medicineName}`}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
