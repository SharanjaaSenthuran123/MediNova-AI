export type HealthStatus = "normal" | "improving" | "attention" | "critical";

export interface HealthStat {
  id: string;
  label: string;
  value: string;
  numericValue?: number;
  decimals?: number;
  unit?: string;
  change?: string;
  status: HealthStatus;
  icon: string;
}

export interface ActivityTimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  type: "vitals" | "medicine" | "ai" | "emergency" | "report";
}

export interface HydrationMetrics {
  currentMl: number;
  goalMl: number;
  glasses: number;
  goalGlasses: number;
  status: HealthStatus;
}

export interface SleepQualityMetrics {
  score: number;
  deepSleepHours: number;
  remHours: number;
  qualityLabel: string;
  status: HealthStatus;
}

export interface AIRiskMetrics {
  score: number;
  trend: string;
  factors: string[];
  lastUpdated: string;
}

export interface PatientSummary {
  name: string;
  age: number;
  bloodType: string;
  lastCheckup: string;
  riskScore: number;
  avatarInitials: string;
  healthScore: number;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  status: "active" | "pending";
}

export type ReportStatus = "Normal" | "Review" | "Complete";

export interface HealthReport {
  id: string;
  title: string;
  date: string;
  status: ReportStatus;
  category: string;
  summary: string;
  provider?: string;
  highlights?: string[];
  healthScore?: number;
  source?: "generated" | "static";
}

export interface TrustStat {
  label: string;
  value: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
  href: string;
  badge?: string;
}
