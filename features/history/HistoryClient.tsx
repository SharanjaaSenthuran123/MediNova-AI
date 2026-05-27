"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  ScanBarcode,
  Stethoscope,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RiskBadge } from "@/components/healthcare/RiskBadge";
import type {
  BarcodeHistoryEntry,
  HistoryType,
  PrescriptionHistoryEntry,
  SymptomHistoryEntry,
} from "@/types/user";

const tabs: { id: HistoryType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "symptoms", label: "Symptoms" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "barcodes", label: "Scans" },
];

import { formatDateTime } from "@/lib/format";

export function HistoryClient() {
  const [tab, setTab] = useState<HistoryType>("all");
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [symptoms, setSymptoms] = useState<SymptomHistoryEntry[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionHistoryEntry[]>([]);
  const [barcodes, setBarcodes] = useState<BarcodeHistoryEntry[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [userRes, historyRes] = await Promise.all([
          fetch("/api/user"),
          fetch(`/api/history?type=${tab}`),
        ]);

        const userData = (await userRes.json()) as { user: unknown };
        setHasProfile(Boolean(userData.user));

        const history = (await historyRes.json()) as {
          symptoms?: SymptomHistoryEntry[];
          prescriptions?: PrescriptionHistoryEntry[];
          barcodes?: BarcodeHistoryEntry[];
        };

        setSymptoms(history.symptoms ?? []);
        setPrescriptions(history.prescriptions ?? []);
        setBarcodes(history.barcodes ?? []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [tab]);

  const totalCount = symptoms.length + prescriptions.length + barcodes.length;
  const showSymptoms = tab === "all" || tab === "symptoms";
  const showPrescriptions = tab === "all" || tab === "prescriptions";
  const showBarcodes = tab === "all" || tab === "barcodes";

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <LoadingSpinner />
        <span className="ml-2 text-sm text-muted">Loading history...</span>
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={User}
          title="Create a profile to save history"
          description="Symptom checks, prescription OCR, and barcode scans are saved automatically once you set up a demo profile."
        />
        <div className="flex justify-center">
          <Link href="/profile">
            <Button>Create profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="space-y-4">
        <HistoryTabs tab={tab} onTabChange={setTab} />
        <EmptyState
          icon={Stethoscope}
          title="No history yet"
          description="Run a symptom check, scan a prescription, or look up a barcode — results will appear here automatically."
        />
        <div className="flex justify-center">
          <Link href="/symptom-checker">
            <Button>Start symptom check</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HistoryTabs tab={tab} onTabChange={setTab} />

      {showSymptoms && symptoms.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
            <Stethoscope className="h-4 w-4" />
            Symptom checks ({symptoms.length})
          </h2>
          <ul className="space-y-3">
            {symptoms.map((entry) => (
              <li key={entry.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{entry.input.symptoms}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDateTime(entry.createdAt)} · Age {entry.input.age} ·{" "}
                        {entry.input.severity}
                      </p>
                    </div>
                    <RiskBadge urgency={entry.result.urgency} />
                  </div>
                  {entry.result.possibleConditions.length > 0 && (
                    <p className="mt-2 text-sm text-muted">
                      Possible: {entry.result.possibleConditions.join(", ")}
                    </p>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showPrescriptions && prescriptions.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
            <FileText className="h-4 w-4" />
            Prescription OCR ({prescriptions.length})
          </h2>
          <ul className="space-y-3">
            {prescriptions.map((entry) => (
              <li key={entry.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {entry.medicines.join(", ")}
                    </p>
                    {entry.source && (
                      <Badge variant="outline">{entry.source}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">{formatDateTime(entry.createdAt)}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {entry.rawTextPreview}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showBarcodes && barcodes.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
            <ScanBarcode className="h-4 w-4" />
            Barcode scans ({barcodes.length})
          </h2>
          <ul className="space-y-3">
            {barcodes.map((entry) => (
              <li key={entry.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{entry.medicineName}</p>
                      <p className="text-xs text-muted">Barcode: {entry.barcode}</p>
                    </div>
                    <Badge variant={entry.found ? "success" : "warning"}>
                      {entry.found ? "Found" : "Not found"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {formatDateTime(entry.createdAt)}
                    {entry.expiry ? ` · Expires ${entry.expiry}` : ""}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function HistoryTabs({
  tab,
  onTabChange,
}: {
  tab: HistoryType;
  onTabChange: (t: HistoryType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="History filter">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={tab === t.id}
          onClick={() => onTabChange(t.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === t.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted/30 text-muted hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
