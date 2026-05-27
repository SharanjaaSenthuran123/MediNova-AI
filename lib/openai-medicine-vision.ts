import OpenAI from "openai";
import { z } from "zod";
import {
  getOpenAIApiKey,
  getOpenAIModel,
  isOpenAIConfigured,
  refreshEnvCache,
} from "@/lib/env";
import type { MedicinePhotoAnalysis } from "@/types/medicine";

const analysisSchema = z.object({
  medicineName: z.string().min(1),
  genericName: z.string().optional(),
  dosage: z.string().optional(),
  manufacturer: z.string().optional(),
  expiry: z.string().optional(),
  barcode: z.string().optional(),
  batchNumber: z.string().optional(),
  warnings: z.array(z.string()).min(1).max(6),
  description: z.string().min(1),
  labelNotes: z.array(z.string()).max(6),
  confidence: z.enum(["high", "medium", "low"]),
});

const SYSTEM_PROMPT = `You are a healthcare vision assistant for MediNova-AI (educational demo only).
Analyze medicine package photos and return ONLY valid JSON:
{
  "medicineName": string,
  "genericName": string | null,
  "dosage": string | null,
  "manufacturer": string | null,
  "expiry": string | null (YYYY-MM-DD if readable, else null),
  "barcode": string | null (digits if visible),
  "batchNumber": string | null,
  "warnings": string[] (2-5 safety warnings visible or typical for this medicine type),
  "description": string (2-3 sentences — educational, not a prescription),
  "labelNotes": string[] (other visible label text: storage, directions),
  "confidence": "high" | "medium" | "low"
}
If the image is unclear or not a medicine package, still return best-effort JSON with low confidence.
Never diagnose. Always note that the user must verify with a pharmacist.`;

export async function analyzeMedicinePhotoWithOpenAI(
  imageDataUrl: string
): Promise<MedicinePhotoAnalysis> {
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
            text: "Analyze this medicine package photo. Extract visible label details and provide educational safety information.",
          },
          {
            type: "image_url",
            image_url: { url: imageDataUrl, detail: "high" },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 900,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = analysisSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new Error("Invalid JSON shape from OpenAI vision");
  }

  const data = parsed.data;
  return {
    medicineName: data.medicineName,
    genericName: data.genericName,
    dosage: data.dosage,
    manufacturer: data.manufacturer,
    expiry: data.expiry,
    barcode: data.barcode,
    batchNumber: data.batchNumber,
    warnings: data.warnings,
    description: data.description,
    labelNotes: data.labelNotes,
    confidence: data.confidence,
    source: "openai",
  };
}
