export type HealthStatus = "normal" | "improving" | "attention" | "critical";

export interface HealthStat {
  id: string;
  label: string;
  value: string;
  unit?: string;
  change?: string;
  status: HealthStatus;
  icon: string;
}

export interface PatientSummary {
  name: string;
  age: number;
  bloodType: string;
  lastCheckup: string;
  riskScore: number;
  avatarInitials: string;
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
