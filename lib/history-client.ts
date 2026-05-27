/**
 * Fire-and-forget history saves from feature clients.
 * Skips silently when no profile session exists.
 */

import type { SymptomCheckRequest, SymptomCheckResult } from "@/types/symptom";
import type { OCRResult } from "@/types/medicine";
import type { Medicine } from "@/types/medicine";

export async function saveSymptomHistory(
  input: SymptomCheckRequest,
  result: SymptomCheckResult
): Promise<boolean> {
  try {
    const res = await fetch("/api/history/symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, result }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function savePrescriptionHistory(result: OCRResult): Promise<boolean> {
  try {
    const res = await fetch("/api/history/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicines: result.medicines.map((m) => m.name),
        rawTextPreview: result.rawText.slice(0, 500),
        source: result.source,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveBarcodeHistory(
  barcode: string,
  medicine: Medicine | null
): Promise<boolean> {
  try {
    const res = await fetch("/api/history/barcodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barcode,
        medicineName: medicine?.name ?? "Not found",
        expiry: medicine?.expiry,
        found: Boolean(medicine),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
