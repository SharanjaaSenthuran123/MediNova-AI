import OpenAI from "openai";
import type { SymptomCheckRequest, SymptomCheckResult } from "@/types/symptom";

const SYSTEM_PROMPT = `You are a healthcare information assistant for MediNova-AI (educational demo only).
Never claim to diagnose. Return ONLY valid JSON matching this schema:
{
  "possibleConditions": string[] (2-4 items, educational possibilities),
  "urgency": "low" | "moderate" | "high" | "emergency",
  "suggestions": string[] (3-5 practical self-care tips),
  "seekDoctorIf": string[] (3-4 warning signs),
  "disclaimer": string (must state this is not a diagnosis)
}
Use calm, clear language. Escalate urgency for red-flag symptoms.`;

export async function analyzeSymptomsWithOpenAI(
  input: SymptomCheckRequest
): Promise<SymptomCheckResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const client = new OpenAI({ apiKey });

  const userMessage = `Patient profile:
- Age: ${input.age}
- Gender: ${input.gender}
- Symptom duration: ${input.duration}
- Severity: ${input.severity}

Symptoms reported:
${input.symptoms}`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
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

  const parsed = JSON.parse(content) as SymptomCheckResult;
  return { ...parsed, source: "openai" };
}
