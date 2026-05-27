export type ReminderSchedule =
  | "morning"
  | "afternoon"
  | "evening"
  | "bedtime"
  | "custom";

export type ReminderChannel = "push" | "email" | "both";

export type ReminderSource = "manual" | "prescription" | "barcode";

export interface ReminderEntry {
  id: string;
  userId: string;
  medicineName: string;
  dosage?: string;
  schedule: ReminderSchedule;
  customTime?: string;
  enabled: boolean;
  channel: ReminderChannel;
  source: ReminderSource;
  createdAt: string;
  lastNotifiedAt?: string;
}

export type AppointmentType = "virtual" | "in-person";

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface AppointmentEntry {
  id: string;
  userId: string;
  providerName: string;
  specialty: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  prepChecklist: string[];
  createdAt: string;
}

export type WearableProvider = "apple_health" | "fitbit" | "garmin";

export interface WearableMetrics {
  heartRate: number;
  sleepHours: number;
  steps: number;
  activeMinutes: number;
}

export interface WearableSyncState {
  connected: boolean;
  provider?: WearableProvider;
  lastSyncAt?: string;
  metrics?: WearableMetrics;
}

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantContext {
  symptoms?: string;
  possibleConditions?: string[];
  urgency?: string;
  suggestions?: string[];
}

export interface AssistantResponse {
  message: string;
  disclaimer: string;
  source: "openai" | "demo";
  demoMode?: boolean;
}
