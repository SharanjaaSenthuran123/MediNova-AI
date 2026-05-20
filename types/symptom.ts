export type UrgencyLevel = "low" | "moderate" | "high" | "emergency";

export interface SymptomCheckRequest {
  symptoms: string;
  age: number;
  gender: string;
  duration: string;
  severity: "mild" | "moderate" | "severe";
}

export interface SymptomCheckResult {
  possibleConditions: string[];
  urgency: UrgencyLevel;
  suggestions: string[];
  seekDoctorIf: string[];
  disclaimer: string;
  source?: "openai" | "demo";
}
