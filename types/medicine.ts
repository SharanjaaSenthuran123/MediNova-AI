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

export interface OCRResult {
  rawText: string;
  medicines: string[];
}
