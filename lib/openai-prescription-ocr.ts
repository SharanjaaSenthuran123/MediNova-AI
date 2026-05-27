import OpenAI from "openai";
import { z } from "zod";
import {
  getOpenAIApiKey,
  getOpenAIModel,
  isOpenAIConfigured,
  refreshEnvCache,
} from "@/lib/env";
import type { DetectedMedicine, OCRResult } from "@/types/medicine";
import { extractMedicineNames } from "@/features/prescription-reader/ocr.helpers";

const medicineSchema = z.object({
  name: z.string().min(1),
  dosageHint: z.string().optional(),
  confidence: z.enum(["high", "medium", "low"]),
});

const prescriptionSchema = z.object({
  rawText: z.string().min(1),
  medicines: z.array(medicineSchema).max(12),
});

const SYSTEM_PROMPT = `You are a prescription OCR assistant for MediNova-AI (educational demo only).
Read the prescription image carefully and return ONLY valid JSON:
{
  "rawText": string (full transcribed prescription text, preserving line breaks as \\n),
  "medicines": [
    {
      "name": string (drug name only, e.g. "Amoxicillin", "Metformin"),
      "dosageHint": string | null (strength + instructions, e.g. "500mg — 1 capsule 3 times daily for 7 days"),
      "confidence": "high" | "medium" | "low"
    }
  ]
}
Rules:
- Extract EVERY medicine listed on the prescription.
- Use correct spelling for common drug names when readable.
- Separate drug name from dosage/instructions in dosageHint.
- Ignore doctor name, patient name, date, address, and signature lines in medicines[] but include them in rawText.
- If handwriting is unclear, use best-effort reading and set confidence to "medium" or "low".
- Never invent medicines not visible on the prescription.`;

export async function analyzePrescriptionWithOpenAI(
  imageDataUrl: string
): Promise<OCRResult> {
  refreshEnvCache();
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const client = new OpenAI({ apiKey: getOpenAIApiKey() });
  const model = getOpenAIModel();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Read this prescription image. Transcribe all text and extract every medicine with name and dosage instructions.",
          },
          {
            type: "image_url",
            image_url: { url: imageDataUrl, detail: "high" },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 1200,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = prescriptionSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new Error("Invalid prescription JSON from OpenAI");
  }

  const medicines: DetectedMedicine[] =
    parsed.data.medicines.length > 0
      ? parsed.data.medicines.map((med) => ({
          name: med.name.trim(),
          dosageHint: med.dosageHint?.trim() || undefined,
          confidence: med.confidence,
        }))
      : extractMedicineNames(parsed.data.rawText);

  return {
    rawText: parsed.data.rawText.trim(),
    medicines,
    source: "openai",
  };
}
