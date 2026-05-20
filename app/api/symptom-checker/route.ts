import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeSymptomsWithOpenAI } from "@/lib/openai";
import { getDemoSymptomResult } from "@/lib/symptom-fallback";

const symptomSchema = z.object({
  symptoms: z
    .string()
    .min(3, "Please describe your symptoms in at least 3 characters")
    .max(2000),
  age: z.coerce.number().int().min(1).max(120),
  gender: z.string().min(1).max(50),
  duration: z.string().min(1).max(100),
  severity: z.enum(["mild", "moderate", "severe"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = symptomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const input = parsed.data;

    try {
      const result = await analyzeSymptomsWithOpenAI(input);
      return NextResponse.json(result);
    } catch {
      const demo = getDemoSymptomResult(input);
      return NextResponse.json({
        ...demo,
        demoMode: true,
        message:
          "OpenAI API key not configured — showing demo analysis. Add OPENAI_API_KEY to .env.local for live AI.",
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process symptom check request" },
      { status: 500 }
    );
  }
}
