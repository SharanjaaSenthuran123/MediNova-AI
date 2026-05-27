import { NextResponse } from "next/server";
import { analyzeSymptomsWithOpenAI } from "@/lib/openai";
import { callAIForJson, isLiveAIConfigured } from "@/lib/ai-config";
import { isOpenAIConfigured } from "@/lib/env";
import { symptomRequestSchema, symptomResultSchema } from "@/lib/schemas/symptom";
import { enrichSymptomResult } from "@/lib/symptom-utils";
import { getDemoSymptomResult } from "@/lib/symptom-fallback";
import type { SymptomCheckRequest } from "@/types/symptom";

const SYSTEM_PROMPT = `You are a healthcare information assistant for MediNova-AI (educational demo only).
Never claim to diagnose. Return ONLY valid JSON matching this schema:
{
  "possibleConditions": string[] (2-4 educational possibilities),
  "conditions": [{ "name": string, "confidence": number 0-100 }],
  "urgency": "low" | "moderate" | "high" | "emergency",
  "urgencyScore": number 0-100,
  "overallConfidence": number 0-100,
  "suggestions": string[] (3-5 practical self-care tips),
  "seekDoctorIf": string[] (3-4 warning signs),
  "disclaimer": string
}`;

function formatValidationErrors(
  fieldErrors: Record<string, string[] | undefined>
): string {
  const first = Object.values(fieldErrors).flat().find(Boolean);
  return first ?? "Please check your input and try again.";
}

async function analyzeWithAnyAI(input: SymptomCheckRequest) {
  if (isOpenAIConfigured()) {
    return analyzeSymptomsWithOpenAI(input);
  }

  const userMessage = `Patient profile:
- Age: ${input.age}
- Gender: ${input.gender}
- Symptom duration: ${input.duration}
- Severity: ${input.severity}

Symptoms reported:
${input.symptoms}`;

  const raw = await callAIForJson({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: userMessage,
    temperature: 0.3,
  });

  const parsed = symptomResultSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid JSON from AI");
  return enrichSymptomResult({ ...parsed.data, source: "openai" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = symptomRequestSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: fieldErrors, message: formatValidationErrors(fieldErrors) },
        { status: 400 }
      );
    }

    const input = parsed.data;

    if (!isLiveAIConfigured()) {
      const demo = getDemoSymptomResult(input);
      return NextResponse.json({
        ...demo,
        demoMode: true,
        message:
          "No AI API key configured — showing demo analysis. Add OPENAI_API_KEY or GEMINI_API_KEY to .env.local for live AI.",
      });
    }

    try {
      const result = await analyzeWithAnyAI(input);
      return NextResponse.json({ ...result, demoMode: false });
    } catch (err) {
      console.error("AI symptom check failed:", err);
      const demo = getDemoSymptomResult(input);
      return NextResponse.json({
        ...demo,
        demoMode: true,
        message:
          "Live AI is temporarily unavailable — showing smart demo analysis. Check your API keys and try again.",
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process symptom check request" },
      { status: 500 }
    );
  }
}
