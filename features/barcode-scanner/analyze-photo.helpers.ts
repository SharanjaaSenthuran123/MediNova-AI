import type { Medicine, MedicinePhotoAnalysis } from "@/types/medicine";
import { readImageAsBase64, validateBarcodePhoto } from "@/lib/barcode-image";

export interface MedicinePhotoAnalysisResult {
  analysis: MedicinePhotoAnalysis;
  demoMode?: boolean;
  message?: string;
  databaseMatch?: Medicine | null;
  barcode?: string | null;
}

export async function analyzeMedicinePhoto(
  file: File
): Promise<MedicinePhotoAnalysisResult> {
  const validationError = validateBarcodePhoto(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const imageBase64 = await readImageAsBase64(file);

  const res = await fetch("/api/medicine-photo-analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      imageBase64,
      mimeType: file.type,
    }),
  });

  if (!res.ok) {
    throw new Error("Medicine photo analysis failed");
  }

  return (await res.json()) as MedicinePhotoAnalysisResult;
}
