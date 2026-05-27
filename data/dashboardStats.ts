import type {
  ActivityTimelineItem,
  AIRiskMetrics,
  EmergencyContact,
  HealthReport,
  HealthStat,
  HydrationMetrics,
  PatientSummary,
  SleepQualityMetrics,
  TrustStat,
} from "@/types/health";

export const patientSummary: PatientSummary = {
  name: "Alex Rivera",
  age: 32,
  bloodType: "O+",
  lastCheckup: "May 12, 2026",
  riskScore: 18,
  healthScore: 82,
  avatarInitials: "AR",
};

export function getRiskLabel(score: number): {
  label: string;
  variant: "success" | "warning" | "danger";
} {
  if (score <= 30) return { label: "Low risk", variant: "success" };
  if (score <= 60) return { label: "Moderate risk", variant: "warning" };
  return { label: "High risk", variant: "danger" };
}

export const healthStats: HealthStat[] = [
  {
    id: "heart-rate",
    label: "Heart Rate",
    value: "72",
    numericValue: 72,
    unit: "bpm",
    change: "-3% vs last week · Live",
    status: "normal",
    icon: "HeartPulse",
  },
  {
    id: "sleep",
    label: "Sleep Score",
    value: "86",
    numericValue: 86,
    unit: "%",
    change: "+5% vs last week",
    status: "improving",
    icon: "Moon",
  },
  {
    id: "medicine",
    label: "Medicine Adherence",
    value: "94",
    numericValue: 94,
    unit: "%",
    change: "On track",
    status: "normal",
    icon: "Pill",
  },
  {
    id: "hydration",
    label: "Hydration",
    value: "1.8",
    numericValue: 1.8,
    decimals: 1,
    unit: "L",
    change: "6/8 glasses today",
    status: "improving",
    icon: "Droplets",
  },
];

export const trustStats: TrustStat[] = [
  { label: "AI-assisted", value: "24/7" },
  { label: "OCR ready", value: "Fast" },
  { label: "Emergency simulation", value: "SOS" },
  { label: "Dashboard analytics", value: "Live" },
];

export const recentReports: HealthReport[] = [
  {
    id: "1",
    title: "Blood Work Panel",
    date: "May 10, 2026",
    status: "Normal",
    category: "Lab",
    provider: "City Health Labs",
    summary:
      "CBC and metabolic panel within normal ranges. Cholesterol slightly improved vs last quarter.",
    highlights: [
      "Hemoglobin 14.2 g/dL — within range",
      "LDL cholesterol down 8% vs Jan 2026",
      "No action required — routine follow-up in 12 months",
    ],
  },
  {
    id: "2",
    title: "Vitamin D Screening",
    date: "Apr 28, 2026",
    status: "Review",
    category: "Lab",
    provider: "City Health Labs",
    summary:
      "Vitamin D at borderline low. Provider suggested supplementation and follow-up in 8 weeks.",
    highlights: [
      "25(OH)D level: 22 ng/mL — borderline low",
      "Recommended: Vitamin D3 2000 IU daily",
      "Recheck scheduled for late June 2026",
    ],
  },
  {
    id: "3",
    title: "Annual Physical",
    date: "Apr 15, 2026",
    status: "Complete",
    category: "Checkup",
    provider: "Dr. Priya Nair — Primary Care",
    summary:
      "Overall wellness good. Blood pressure 118/76. Continue current exercise and sleep routine.",
    highlights: [
      "Blood pressure 118/76 mmHg",
      "BMI 23.4 — healthy range",
      "Continue 7+ hours sleep and 150 min/week activity",
    ],
  },
  {
    id: "4",
    title: "Chest X-Ray",
    date: "Mar 22, 2026",
    status: "Normal",
    category: "Imaging",
    provider: "Metro Imaging Center",
    summary:
      "No acute cardiopulmonary findings. Lungs clear. Ordered after mild persistent cough (resolved).",
    highlights: [
      "No infiltrates or effusions",
      "Heart size within normal limits",
      "Correlate with resolved cough — no further imaging needed",
    ],
  },
  {
    id: "5",
    title: "Lipid Panel Follow-up",
    date: "Feb 8, 2026",
    status: "Review",
    category: "Lab",
    provider: "City Health Labs",
    summary:
      "Triglycerides mildly elevated. Diet and exercise plan discussed; recheck in 3 months.",
    highlights: [
      "Triglycerides 168 mg/dL — mildly elevated",
      "HDL 52 mg/dL — acceptable",
      "Reduce refined carbs; recheck May 2026",
    ],
  },
];

export const medicineSchedule = [
  { name: "Vitamin D3", time: "8:00 AM", taken: true },
  { name: "Omega-3", time: "1:00 PM", taken: false },
  { name: "Magnesium", time: "9:00 PM", taken: false },
];

export const emergencyContacts: EmergencyContact[] = [
  {
    name: "Jordan Rivera",
    relation: "Spouse",
    phone: "+1 (555) 014-2201",
    status: "active",
  },
  {
    name: "Dr. Priya Nair",
    relation: "Primary care",
    phone: "+1 (555) 014-8890",
    status: "active",
  },
];

export const aiRiskMetrics: AIRiskMetrics = {
  score: 18,
  trend: "↓ 4 pts vs last month",
  factors: ["Stable vitals", "Strong adherence", "Good sleep trend"],
  lastUpdated: "Updated 2 min ago",
};

export const sleepQuality: SleepQualityMetrics = {
  score: 86,
  deepSleepHours: 1.8,
  remHours: 2.1,
  qualityLabel: "Restorative",
  status: "improving",
};

export const hydrationMetrics: HydrationMetrics = {
  currentMl: 1800,
  goalMl: 2400,
  glasses: 6,
  goalGlasses: 8,
  status: "improving",
};

export const activityTimeline: ActivityTimelineItem[] = [
  {
    id: "1",
    time: "8:02 AM",
    title: "Vitamin D3 taken",
    description: "Medicine reminder completed",
    type: "medicine",
  },
  {
    id: "2",
    time: "7:45 AM",
    title: "Morning vitals sync",
    description: "Heart rate 72 bpm · Sleep score 86%",
    type: "vitals",
  },
  {
    id: "3",
    time: "Yesterday",
    title: "AI risk assessment",
    description: "Low risk · No new symptom flags",
    type: "ai",
  },
  {
    id: "4",
    time: "May 18",
    title: "Emergency contacts verified",
    description: "2 contacts active for SOS simulation",
    type: "emergency",
  },
  {
    id: "5",
    time: "May 10",
    title: "Blood work uploaded",
    description: "Lab report marked Normal",
    type: "report",
  },
];

export function getNextMedicineReminder() {
  return medicineSchedule.find((m) => !m.taken) ?? null;
}
