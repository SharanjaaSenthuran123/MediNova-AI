"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Heart, Moon, RefreshCw, Watch } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { WearableProvider, WearableSyncState } from "@/types/integrations";

const providers: {
  id: WearableProvider;
  label: string;
  description: string;
}[] = [
  {
    id: "apple_health",
    label: "Apple Health",
    description: "Heart rate, sleep, steps from iPhone & Apple Watch",
  },
  {
    id: "fitbit",
    label: "Fitbit",
    description: "Activity, sleep stages, resting heart rate",
  },
  {
    id: "garmin",
    label: "Garmin",
    description: "Training load, sleep score, daily steps",
  },
];

export function WearableSyncCard() {
  const [sync, setSync] = useState<WearableSyncState>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, syncRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/wearables"),
      ]);
      const userData = (await userRes.json()) as { user: unknown };
      setHasProfile(Boolean(userData.user));

      const data = (await syncRes.json()) as { sync: WearableSyncState };
      setSync(data.sync ?? { connected: false });
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function connect(provider: WearableProvider) {
    setSyncing(true);
    try {
      const res = await fetch("/api/wearables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = (await res.json()) as { sync: WearableSyncState };
      if (res.ok) setSync(data.sync);
    } finally {
      setSyncing(false);
    }
  }

  async function disconnect() {
    setSyncing(true);
    try {
      await fetch("/api/wearables", { method: "DELETE" });
      setSync({ connected: false });
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" />
      </Card>
    );
  }

  return (
    <Card>
      <section className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Watch className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Wearable sync</h2>
            <p className="text-sm text-muted">
              Import vitals into your dashboard — demo simulation
            </p>
          </div>
        </div>
        <Badge variant={sync.connected ? "success" : "outline"}>
          {sync.connected ? "Connected" : "Not connected"}
        </Badge>
      </section>

      {!hasProfile ? (
        <p className="mt-4 text-sm text-muted">
          <Link href="/profile" className="text-primary underline">
            Create a profile
          </Link>{" "}
          to simulate wearable imports.
        </p>
      ) : sync.connected && sync.metrics ? (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-muted">
            Last sync:{" "}
            {sync.lastSyncAt
              ? new Date(sync.lastSyncAt).toLocaleString()
              : "—"}{" "}
            · {sync.provider?.replace("_", " ")}
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <li className="rounded-xl border border-border p-3 text-center">
              <Heart className="mx-auto h-4 w-4 text-danger" />
              <p className="mt-1 text-lg font-semibold">
                {sync.metrics.heartRate}
              </p>
              <p className="text-xs text-muted">BPM</p>
            </li>
            <li className="rounded-xl border border-border p-3 text-center">
              <Moon className="mx-auto h-4 w-4 text-secondary" />
              <p className="mt-1 text-lg font-semibold">
                {sync.metrics.sleepHours}h
              </p>
              <p className="text-xs text-muted">Sleep</p>
            </li>
            <li className="rounded-xl border border-border p-3 text-center">
              <Activity className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-lg font-semibold">
                {sync.metrics.steps.toLocaleString()}
              </p>
              <p className="text-xs text-muted">Steps</p>
            </li>
            <li className="rounded-xl border border-border p-3 text-center">
              <RefreshCw className="mx-auto h-4 w-4 text-warning" />
              <p className="mt-1 text-lg font-semibold">
                {sync.metrics.activeMinutes}
              </p>
              <p className="text-xs text-muted">Active min</p>
            </li>
          </ul>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void disconnect()}
            disabled={syncing}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {providers.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => void connect(p.id)}
                disabled={syncing}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted">{p.description}</p>
                </div>
                {syncing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Badge variant="outline">Connect</Badge>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
