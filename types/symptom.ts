export type UrgencyLevel = "low" | "moderate" | "high" | "emergency";

export interface ConditionMatch {
  name: string;
  confidence: number;
}

export interface SymptomCheckRequest {
  symptoms: string;
  age: number;
  gender: string;
  duration: string;
  severity: "mild" | "moderate" | "severe";
}

export interface SymptomCheckResult {
  possibleConditions: string[];
  conditions?: ConditionMatch[];
  urgency: UrgencyLevel;
  urgencyScore?: number;
  overallConfidence?: number;
  suggestions: string[];
  seekDoctorIf: string[];
  disclaimer: string;
  source?: "openai" | "demo";
}

export interface SymptomCheckApiResponse extends SymptomCheckResult {
  demoMode?: boolean;
  message?: string;
}
