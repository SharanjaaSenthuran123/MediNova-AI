import { NextResponse } from "next/server";
import { callAIForJson, isLiveAIConfigured } from "@/lib/ai-config";
import {
  getDailyInsight,
  getDemoHealthTips,
  type HealthTip,
} from "@/lib/health-tips-fallback";

const SYSTEM = `You are a wellness coach for MediNova-AI (educational demo only).
Return ONLY valid JSON:
{
  "tips": [
    { "category": "hydration"|"sleep"|"exercise"|"wellness"|"nutrition", "title": string, "body": string, "badge": string }
  ] (exactly 4 tips, one per category if possible),
  "dailyInsight": string (1-2 sentences),
  "disclaimer": string
}
Never diagnose. Keep tips practical and beginner-friendly.`;

export async function GET() {
  if (!isLiveAIConfigured()) {
    const tips = getDemoHealthTips(4);
    return NextResponse.json({
      tips,
      dailyInsight: getDailyInsight(),
      disclaimer: "General wellness education only — not medical advice.",
      demoMode: true,
    });
  }

  try {
    const result = await callAIForJson<{
      tips: HealthTip[];
      dailyInsight: string;
      disclaimer: string;
    }>({
      systemPrompt: SYSTEM,
      userPrompt: `Generate 4 fresh health tips for today (${new Date().toLocaleDateString()}). Include hydration, sleep, exercise, and wellness categories.`,
      temperature: 0.7,
    });

    const tips = (result.tips ?? []).map((t, i) => ({
      ...t,
      id: t.id ?? `ai-${i}-${Date.now()}`,
    }));

    return NextResponse.json({
      tips: tips.length ? tips : getDemoHealthTips(4),
      dailyInsight: result.dailyInsight ?? getDailyInsight(),
      disclaimer:
        result.disclaimer ??
        "General wellness education only — not medical advice.",
      demoMode: false,
    });
  } catch (err) {
    console.error("Health tips AI failed:", err);
    return NextResponse.json({
      tips: getDemoHealthTips(4),
      dailyInsight: getDailyInsight(),
      disclaimer: "AI temporarily unavailable — showing smart demo tips.",
      demoMode: true,
    });
  }
}
