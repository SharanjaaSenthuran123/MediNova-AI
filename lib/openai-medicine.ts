import OpenAI from "openai";
import { z } from "zod";
import {
  getOpenAIApiKey,
  getOpenAIModel,
  isOpenAIConfigured,
  refreshEnvCache,
} from "@/lib/env";
import type { Medicine, MedicineAIInsight } from "@/types/medicine";

const insightSchema = z.object({
  safetySummary: z.string().min(1),
  interactionTips: z.array(z.string()).min(2).max(5),
  whenToSeekHelp: z.array(z.string()).min(2).max(4),
});

const SYSTEM_PROMPT = `You are a healthcare information assistant for MediNova-AI (educational demo only).
Given medicine details from a barcode lookup, return ONLY valid JSON:
{
  "safetySummary": string (2-3 calm sentences about safe use — never prescribe),
  "interactionTips": string[] (3-4 practical tips: food, alcohol, timing, storage),
  "whenToSeekHelp": string[] (3 red-flag situations to contact a doctor/pharmacist)
}
Never claim to diagnose. Always remind users to verify the physical label.`;

export async function enrichMedicineWithOpenAI(
  medicine: Medicine
): Promise<MedicineAIInsight> {
  refreshEnvCache();
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const client = new OpenAI({ apiKey: getOpenAIApiKey() });

  const userMessage = `Medicine record:
- Name: ${medicine.name}
- Generic: ${medicine.genericName}
- Dosage: ${medicine.dosage}
- Manufacturer: ${medicine.manufacturer}
- Expiry: ${medicine.expiry}
- Description: ${medicine.description ?? "N/A"}
- Warnings: ${medicine.warnings.join("; ")}`;

  const completion = await client.chat.completions.create({
    model: getOpenAIModel(),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = insightSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new Error("Invalid JSON shape from OpenAI");
  }

  return { ...parsed.data, source: "openai" };
}
