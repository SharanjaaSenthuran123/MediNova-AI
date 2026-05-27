import {
  SymptomRecord,
  Prescription,
  MedicineScan,
} from "../models/Clinical.js";
import { DeliveryOrder } from "../models/Order.js";
import { Appointment } from "../models/Appointment.js";

export interface HealthReportDto {
  id: string;
  title: string;
  date: string;
  status: "Normal" | "Review" | "Complete";
  category: string;
  summary: string;
  provider?: string;
  highlights?: string[];
  healthScore?: number;
  source: "generated" | "static";
}

function formatDate(iso: Date | string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function urgencyToStatus(urgency: string): HealthReportDto["status"] {
  if (urgency === "emergency" || urgency === "high" || urgency === "moderate") {
    return "Review";
  }
  return "Normal";
}

function symptomToReport(s: InstanceType<typeof SymptomRecord>): HealthReportDto {
  const result = s.result as {
    urgency?: string;
    urgencyScore?: number;
    conditions?: { name: string }[];
    possibleConditions?: string[];
    suggestions?: string[];
  };
  const input = s.input as { symptoms?: string };
  const top =
    result.conditions?.[0]?.name ??
    result.possibleConditions?.[0] ??
    "Symptom assessment";
  const symptoms = input.symptoms ?? "";

  return {
    id: `sym-${s._id.toString()}`,
    title: `AI Symptom Check — ${top}`,
    date: formatDate(s.createdAt),
    status: urgencyToStatus(result.urgency ?? "low"),
    category: "AI Assessment",
    provider: "MediNova AI Symptom Checker",
    summary: `Educational analysis for: ${symptoms.slice(0, 120)}${symptoms.length > 120 ? "…" : ""}. Urgency: ${result.urgency ?? "unknown"}.`,
    highlights: [
      `Urgency level: ${result.urgency ?? "unknown"}`,
      ...(result.possibleConditions?.slice(0, 2).map((c) => `Possible: ${c}`) ?? []),
      ...(result.suggestions?.slice(0, 2) ?? []),
    ],
    healthScore: Math.max(0, 100 - (result.urgencyScore ?? 30)),
    source: "generated",
  };
}

function prescriptionToReport(p: InstanceType<typeof Prescription>): HealthReportDto {
  const meds = p.medicines.join(", ") || "Unknown medicines";
  return {
    id: `rx-${p._id.toString()}`,
    title: "Prescription OCR Scan",
    date: formatDate(p.createdAt),
    status: p.medicines.length ? "Complete" : "Review",
    category: "Prescription",
    provider: "MediNova OCR Reader",
    summary: `Extracted medicines: ${meds}. Source: ${p.source ?? "ocr"}.`,
    highlights: [
      ...p.medicines.slice(0, 4).map((m) => `Detected: ${m}`),
      p.rawTextPreview
        ? `Text preview: ${p.rawTextPreview.slice(0, 80)}…`
        : "Manual verification recommended",
    ],
    source: "generated",
  };
}

function barcodeToReport(b: InstanceType<typeof MedicineScan>): HealthReportDto {
  return {
    id: `bc-${b._id.toString()}`,
    title: `Medicine Scan — ${b.medicineName}`,
    date: formatDate(b.createdAt),
    status: b.found ? "Normal" : "Review",
    category: "Medicine",
    provider: "MediNova Smart Scanner",
    summary: b.found
      ? `Barcode ${b.barcode} matched ${b.medicineName}${b.expiry ? `. Expiry: ${b.expiry}` : ""}.`
      : `Barcode ${b.barcode} not found in database — verify manually.`,
    highlights: [
      `Barcode: ${b.barcode}`,
      `Medicine: ${b.medicineName}`,
      b.expiry ? `Expiry: ${b.expiry}` : "Expiry: verify on package",
    ],
    source: "generated",
  };
}

function orderToReport(o: InstanceType<typeof DeliveryOrder>): HealthReportDto {
  const items = o.items.map((i) => `${i.medicineName} ×${i.quantity}`).join(", ");
  return {
    id: `ord-${o._id.toString()}`,
    title: `Medicine Order — $${o.totalAmount.toFixed(2)}`,
    date: formatDate(o.createdAt),
    status: o.status === "delivered" ? "Complete" : "Review",
    category: "Pharmacy Order",
    provider: "MediNova Online Pharmacy",
    summary: `Order status: ${o.status}. Items: ${items}.`,
    highlights: [
      `Status: ${o.status}`,
      `Payment: ${o.paymentStatus}`,
      o.deliveryAddress ? `Deliver to: ${o.deliveryAddress.slice(0, 60)}` : "Delivery address on file",
    ],
    source: "generated",
  };
}

function appointmentToReport(a: InstanceType<typeof Appointment>): HealthReportDto {
  return {
    id: `appt-${a._id.toString()}`,
    title: `Appointment — ${a.providerName}`,
    date: formatDate(a.createdAt),
    status: a.status === "completed" ? "Complete" : "Review",
    category: "Appointment",
    provider: a.providerName,
    summary: `${a.specialty} on ${a.date} at ${a.time} (${a.type}). Status: ${a.status}.`,
    highlights: [a.specialty, `${a.date} ${a.time}`, `Type: ${a.type}`],
    source: "generated",
  };
}

export async function buildUserReports(userId: string) {
  const [symptoms, prescriptions, barcodes, orders, appointments] = await Promise.all([
    SymptomRecord.find({ userId }).sort({ createdAt: -1 }).limit(30),
    Prescription.find({ userId }).sort({ createdAt: -1 }).limit(30),
    MedicineScan.find({ userId }).sort({ createdAt: -1 }).limit(30),
    DeliveryOrder.find({ userId }).sort({ createdAt: -1 }).limit(20),
    Appointment.find({ userId }).sort({ createdAt: -1 }).limit(20),
  ]);

  const reports: HealthReportDto[] = [
    ...symptoms.map(symptomToReport),
    ...prescriptions.map(prescriptionToReport),
    ...barcodes.map(barcodeToReport),
    ...orders.map(orderToReport),
    ...appointments.map(appointmentToReport),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const scores = reports
    .map((r) => r.healthScore)
    .filter((s): s is number => typeof s === "number");

  const healthScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : reports.length > 0
        ? 85
        : 82;

  return {
    reports,
    healthScore,
    generatedCount: reports.filter((r) => r.source === "generated").length,
  };
}
