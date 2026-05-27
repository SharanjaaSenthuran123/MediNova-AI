import OpenAI from "openai";
import {
  getOpenAIApiKey,
  getOpenAIModel,
  isOpenAIConfigured,
  refreshEnvCache,
} from "@/lib/env";
import { enrichSymptomResult } from "@/lib/symptom-utils";
import { symptomResultSchema } from "@/lib/schemas/symptom";
import type { SymptomCheckRequest, SymptomCheckResult } from "@/types/symptom";

const SYSTEM_PROMPT = `You are a healthcare information assistant for MediNova-AI (educational demo only).
Never claim to diagnose. Return ONLY valid JSON matching this schema:
{
  "possibleConditions": string[] (2-4 educational possibilities),
  "conditions": [{ "name": string, "confidence": number 0-100 }] (same items as possibleConditions, confidence = educational match strength, highest first),
  "urgency": "low" | "moderate" | "high" | "emergency",
  "urgencyScore": number 0-100 (overall urgency intensity),
  "overallConfidence": number 0-100 (confidence in the analysis quality),
  "suggestions": string[] (3-5 practical self-care tips),
  "seekDoctorIf": string[] (3-4 warning signs),
  "disclaimer": string (must state this is not a diagnosis)
}
Use calm, clear language. Escalate urgency for red-flag symptoms.`;

export async function analyzeSymptomsWithOpenAI(
  input: SymptomCheckRequest
): Promise<SymptomCheckResult> {
  refreshEnvCache();
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const client = new OpenAI({ apiKey: getOpenAIApiKey() });

  const userMessage = `Patient profile:
- Age: ${input.age}
- Gender: ${input.gender}
- Symptom duration: ${input.duration}
- Severity: ${input.severity}

Symptoms reported:
${input.symptoms}`;

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

  const raw = JSON.parse(content) as unknown;
  const parsed = symptomResultSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Invalid JSON shape from OpenAI");
  }

  return enrichSymptomResult({ ...parsed.data, source: "openai" });
}
