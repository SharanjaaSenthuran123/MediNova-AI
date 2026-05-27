import { NextResponse } from "next/server";
import { callAIForJson, isLiveAIConfigured } from "@/lib/ai-config";
import { getDemoDashboardInsight } from "@/lib/dashboard-insight-fallback";

const SYSTEM = `You are a healthcare analytics assistant for MediNova-AI (educational demo).
Return ONLY valid JSON: { "insight": string (2-3 sentences, calm, actionable), "disclaimer": string }
Never diagnose. Reference vitals trends when provided.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      heartRate?: number;
      sleep?: number;
      adherence?: number;
      hydration?: number;
      riskScore?: number;
    };

    if (!isLiveAIConfigured()) {
      return NextResponse.json({
        insight: getDemoDashboardInsight(body),
        disclaimer: "Educational insight only — not medical advice.",
        demoMode: true,
      });
    }

    try {
      const result = await callAIForJson<{ insight: string; disclaimer: string }>({
        systemPrompt: SYSTEM,
        userPrompt: `Current live vitals:
- Heart rate: ${body.heartRate ?? 72} bpm
- Sleep score: ${body.sleep ?? 86}%
- Medicine adherence: ${body.adherence ?? 94}%
- Hydration: ${body.hydration ?? 1.8} L
- AI risk score: ${body.riskScore ?? 18}

Generate a personalized daily health insight.`,
        temperature: 0.4,
      });

      return NextResponse.json({ ...result, demoMode: false });
    } catch (err) {
      console.error("Dashboard insight AI failed:", err);
      return NextResponse.json({
        insight: getDemoDashboardInsight(body),
        disclaimer: "Educational insight only — AI temporarily unavailable.",
        demoMode: true,
      });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
