import {
  cleanOCRText,
  extractMedicineNames,
  type OCRProgressState,
} from "@/features/prescription-reader/ocr.helpers";
import { fileToDataUrl } from "@/lib/image-preprocess";
import { recognizePrescriptionImage } from "@/lib/tesseract-ocr";
import type { OCRResult } from "@/types/medicine";

async function isLiveAiEnabled(): Promise<boolean> {
  try {
    const res = await fetch("/api/config/status", { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { liveAi?: boolean };
    return Boolean(data.liveAi);
  } catch {
    return false;
  }
}

async function scanWithVisionAi(
  file: File,
  onProgress?: (state: OCRProgressState) => void
): Promise<OCRResult | null> {
  onProgress?.({
    progress: 20,
    stage: "recognizing",
    stageLabel: "Reading prescription with AI vision…",
  });

  const imageBase64 = await fileToDataUrl(file);
  const res = await fetch("/api/prescription-ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64,
      mimeType: file.type || undefined,
    }),
  });

  const data = (await res.json()) as OCRResult & {
    error?: string;
    message?: string;
    demoMode?: boolean;
  };

  if (!res.ok || !data.rawText) {
    return null;
  }

  onProgress?.({
    progress: 100,
    stage: "complete",
    stageLabel: "Scan complete",
  });

  return {
    rawText: data.rawText,
    medicines: data.medicines ?? [],
    source: data.source === "openai" ? "openai" : "ocr",
    message: data.message,
  };
}

/** Prefer AI vision when configured; fall back to preprocessed browser OCR. */
export async function scanPrescriptionImage(
  file: File,
  onProgress?: (state: OCRProgressState) => void
): Promise<OCRResult> {
  if (await isLiveAiEnabled()) {
    try {
      const aiResult = await scanWithVisionAi(file, onProgress);
      if (aiResult?.rawText?.trim()) {
        if (aiResult.medicines.length > 0) {
          return aiResult;
        }
        const parsed = extractMedicineNames(aiResult.rawText);
        if (parsed.length > 0) {
          return { ...aiResult, medicines: parsed };
        }
      }
    } catch (err) {
      console.warn("AI prescription scan failed, using browser OCR:", err);
    }
  }

  onProgress?.({
    progress: 5,
    stage: "loading-engine",
    stageLabel: "Loading OCR engine…",
  });

  const rawText = cleanOCRText(
    await recognizePrescriptionImage(file, onProgress)
  );

  const medicines = extractMedicineNames(rawText);

  onProgress?.({
    progress: 100,
    stage: "complete",
    stageLabel: "Scan complete",
  });

  return {
    rawText,
    medicines,
    source: "ocr",
    message:
      medicines.length === 0
        ? "Text was detected but no medicines could be parsed. Try a clearer photo or enable OPENAI_API_KEY for AI vision reading."
        : undefined,
  };
}
