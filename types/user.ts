import type { EmergencyContact } from "@/types/emergency";
import type {
  AppointmentEntry,
  ReminderEntry,
  WearableSyncState,
} from "@/types/integrations";
import type { SymptomCheckRequest, SymptomCheckResult } from "@/types/symptom";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  avatarInitials: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredEmergencyContact extends EmergencyContact {
  id: string;
}

export interface SymptomHistoryEntry {
  id: string;
  userId: string;
  createdAt: string;
  input: SymptomCheckRequest;
  result: SymptomCheckResult;
}

export interface PrescriptionHistoryEntry {
  id: string;
  userId: string;
  createdAt: string;
  medicines: string[];
  rawTextPreview: string;
  source?: "ocr" | "demo" | "openai";
}

export interface BarcodeHistoryEntry {
  id: string;
  userId: string;
  createdAt: string;
  barcode: string;
  medicineName: string;
  expiry?: string;
  found: boolean;
}

export interface UserRecord {
  profile: UserProfile;
  emergencyContacts: StoredEmergencyContact[];
  symptomHistory: SymptomHistoryEntry[];
  prescriptionHistory: PrescriptionHistoryEntry[];
  barcodeHistory: BarcodeHistoryEntry[];
  reminders: ReminderEntry[];
  appointments: AppointmentEntry[];
  wearableSync: WearableSyncState;
}

export interface DataStore {
  users: Record<string, UserRecord>;
}

export type HistoryType = "symptoms" | "prescriptions" | "barcodes" | "all";

export interface HistoryResponse {
  symptoms: SymptomHistoryEntry[];
  prescriptions: PrescriptionHistoryEntry[];
  barcodes: BarcodeHistoryEntry[];
}
