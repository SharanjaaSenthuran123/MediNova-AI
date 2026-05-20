import type { HealthStat, PatientSummary, TrustStat } from "@/types/health";

export const patientSummary: PatientSummary = {
  name: "Alex Rivera",
  age: 32,
  bloodType: "O+",
  lastCheckup: "May 12, 2026",
  riskScore: 18,
  avatarInitials: "AR",
};

export const healthStats: HealthStat[] = [
  {
    id: "heart-rate",
    label: "Heart Rate",
    value: "72",
    unit: "bpm",
    change: "-3% vs last week",
    status: "normal",
    icon: "HeartPulse",
  },
  {
    id: "sleep",
    label: "Sleep Score",
    value: "86",
    unit: "%",
    change: "+5% vs last week",
    status: "improving",
    icon: "Moon",
  },
  {
    id: "medicine",
    label: "Medicine Adherence",
    value: "94",
    unit: "%",
    change: "On track",
    status: "normal",
    icon: "Pill",
  },
  {
    id: "risk",
    label: "Health Risk Score",
    value: "18",
    unit: "/100",
    change: "Low risk",
    status: "improving",
    icon: "Activity",
  },
];

export const trustStats: TrustStat[] = [
  { label: "AI Guidance", value: "24/7" },
  { label: "Prescription OCR", value: "Fast" },
  { label: "Emergency Ready", value: "SOS" },
  { label: "Privacy First", value: "Secure" },
];

export const recentReports = [
  {
    id: "1",
    title: "Blood Work Panel",
    date: "May 10, 2026",
    status: "Normal",
  },
  {
    id: "2",
    title: "Vitamin D Screening",
    date: "Apr 28, 2026",
    status: "Review",
  },
  {
    id: "3",
    title: "Annual Physical",
    date: "Apr 15, 2026",
    status: "Complete",
  },
];

export const medicineSchedule = [
  { name: "Vitamin D3", time: "8:00 AM", taken: true },
  { name: "Omega-3", time: "1:00 PM", taken: false },
  { name: "Magnesium", time: "9:00 PM", taken: false },
];
