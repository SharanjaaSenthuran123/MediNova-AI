export interface Medicine {
  barcode: string;
  name: string;
  genericName: string;
  dosage: string;
  manufacturer: string;
  expiry: string;
  warnings: string[];
  description?: string;
}

export type MedicineConfidence = "high" | "medium" | "low";

export interface DetectedMedicine {
  name: string;
  dosageHint?: string;
  confidence: MedicineConfidence;
}

export interface OCRResult {
  rawText: string;
  medicines: DetectedMedicine[];
  source?: "ocr" | "demo" | "openai";
  message?: string;
}

export interface MedicineAIInsight {
  safetySummary: string;
  interactionTips: string[];
  whenToSeekHelp: string[];
  source: "openai" | "demo";
}

export interface MedicineLookupResponse {
  medicine: Medicine;
  barcode: string;
  demoMode?: boolean;
  aiInsight?: MedicineAIInsight;
  message?: string;
}

export type PhotoAnalysisConfidence = "high" | "medium" | "low";

export interface MedicinePhotoAnalysis {
  medicineName: string;
  genericName?: string;
  dosage?: string;
  manufacturer?: string;
  expiry?: string;
  barcode?: string;
  batchNumber?: string;
  warnings: string[];
  description: string;
  labelNotes: string[];
  confidence: PhotoAnalysisConfidence;
  source: "openai" | "demo";
}
