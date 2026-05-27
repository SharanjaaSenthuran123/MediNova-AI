import { NextResponse } from "next/server";
import {
  getOpenAIConfigHint,
  getOpenAIConfigStatus,
  isAnyAIConfigured,
  isGeminiConfigured,
  isOpenAIConfigured,
} from "@/lib/env";

export async function GET() {
  const status = getOpenAIConfigStatus();
  const liveAi = isAnyAIConfigured();

  let hint: string | null = null;
  if (!liveAi) {
    hint =
      "Add OPENAI_API_KEY or GEMINI_API_KEY to .env.local for live AI across Symptom Checker, Health Tips, Dashboard insights, and Medicine Scanner.";
  } else if (!isOpenAIConfigured() && isGeminiConfigured()) {
    hint = "Using Gemini API for live AI. Add OPENAI_API_KEY for OpenAI Vision on medicine photos.";
  } else if (status !== "configured") {
    hint = getOpenAIConfigHint();
  }

  return NextResponse.json({
    openai: status,
    gemini: isGeminiConfigured() ? "configured" : "missing_key",
    liveAi,
    provider: isOpenAIConfigured()
      ? "openai"
      : isGeminiConfigured()
        ? "gemini"
        : "none",
    hint,
  });
}
