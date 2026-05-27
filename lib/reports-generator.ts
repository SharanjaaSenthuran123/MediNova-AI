import { recentReports } from "@/data/dashboardStats";
import type { HealthReport } from "@/types/health";
import type {
  BarcodeHistoryEntry,
  PrescriptionHistoryEntry,
  SymptomHistoryEntry,
} from "@/types/user";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function urgencyToStatus(
  urgency: string
): HealthReport["status"] {
  if (urgency === "emergency" || urgency === "high") return "Review";
  if (urgency === "moderate") return "Review";
  return "Normal";
}

export function symptomToReport(entry: SymptomHistoryEntry): HealthReport {
  const top =
    entry.result.conditions?.[0]?.name ??
    entry.result.possibleConditions?.[0] ??
    "Symptom assessment";

  return {
    id: `sym-${entry.id}`,
    title: `AI Symptom Check — ${top}`,
    date: formatDate(entry.createdAt),
    status: urgencyToStatus(entry.result.urgency),
    category: "AI Assessment",
    provider: "MediNova AI Symptom Checker",
    summary: `Educational analysis for: ${entry.input.symptoms.slice(0, 120)}${entry.input.symptoms.length > 120 ? "…" : ""}. Urgency: ${entry.result.urgency}.`,
    highlights: [
      `Urgency level: ${entry.result.urgency}`,
      ...(entry.result.possibleConditions?.slice(0, 2).map((c) => `Possible: ${c}`) ?? []),
      ...(entry.result.suggestions?.slice(0, 2) ?? []),
    ],
    healthScore: Math.max(0, 100 - (entry.result.urgencyScore ?? 30)),
    source: "generated",
  };
}

export function prescriptionToReport(entry: PrescriptionHistoryEntry): HealthReport {
  const meds = entry.medicines.join(", ") || "Unknown medicines";
  return {
    id: `rx-${entry.id}`,
    title: `Prescription OCR Scan`,
    date: formatDate(entry.createdAt),
    status: entry.medicines.length ? "Complete" : "Review",
    category: "Prescription",
    provider: "MediNova OCR Reader",
    summary: `Extracted medicines: ${meds}. Source: ${entry.source ?? "ocr"}.`,
    highlights: [
      ...entry.medicines.slice(0, 4).map((m) => `Detected: ${m}`),
      entry.rawTextPreview
        ? `Text preview: ${entry.rawTextPreview.slice(0, 80)}…`
        : "Manual verification recommended",
    ],
    source: "generated",
  };
}

export function barcodeToReport(entry: BarcodeHistoryEntry): HealthReport {
  return {
    id: `bc-${entry.id}`,
    title: `Medicine Scan — ${entry.medicineName}`,
    date: formatDate(entry.createdAt),
    status: entry.found ? "Normal" : "Review",
    category: "Medicine",
    provider: "MediNova Smart Scanner",
    summary: entry.found
      ? `Barcode ${entry.barcode} matched ${entry.medicineName}${entry.expiry ? `. Expiry: ${entry.expiry}` : ""}.`
      : `Barcode ${entry.barcode} not found in database — verify manually.`,
    highlights: [
      `Barcode: ${entry.barcode}`,
      `Medicine: ${entry.medicineName}`,
      entry.expiry ? `Expiry: ${entry.expiry}` : "Expiry: verify on package",
    ],
    source: "generated",
  };
}

export function buildReportsFromHistory(
  symptoms: SymptomHistoryEntry[],
  prescriptions: PrescriptionHistoryEntry[],
  barcodes: BarcodeHistoryEntry[]
): HealthReport[] {
  const generated = [
    ...symptoms.map(symptomToReport),
    ...prescriptions.map(prescriptionToReport),
    ...barcodes.map(barcodeToReport),
  ].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const staticReports = recentReports.map((r) => ({
    ...r,
    source: "static" as const,
  }));

  const seen = new Set<string>();
  const merged: HealthReport[] = [];

  for (const report of [...generated, ...staticReports]) {
    if (seen.has(report.id)) continue;
    seen.add(report.id);
    merged.push(report);
  }

  return merged;
}

export function computeHealthScoreSummary(reports: HealthReport[]): number {
  const scores = reports
    .map((r) => r.healthScore)
    .filter((s): s is number => typeof s === "number");
  if (!scores.length) return 82;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
