/**
 * Unified AI configuration — OpenAI primary, Google Gemini fallback.
 * Keys stay server-side only; never expose on the client.
 */

import OpenAI from "openai";
import {
  getGeminiApiKey,
  getOpenAIApiKey,
  getOpenAIModel,
  isGeminiConfigured,
  isOpenAIConfigured,
  refreshEnvCache,
} from "@/lib/env";

const AI_TIMEOUT_MS = 28_000;

export type AIProvider = "openai" | "gemini" | "none";

export interface CallAIForJsonOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

export function isLiveAIConfigured(): boolean {
  return isOpenAIConfigured() || isGeminiConfigured();
}

export function getActiveAIProvider(): AIProvider {
  if (isOpenAIConfigured()) return "openai";
  if (isGeminiConfigured()) return "gemini";
  return "none";
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("AI request timed out")), ms)
    ),
  ]);
}

async function callOpenAIJson<T>(
  options: CallAIForJsonOptions
): Promise<T> {
  refreshEnvCache();
  const client = new OpenAI({ apiKey: getOpenAIApiKey() });

  const completion = await client.chat.completions.create({
    model: getOpenAIModel(),
    messages: [
      { role: "system", content: options.systemPrompt },
      { role: "user", content: options.userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: options.temperature ?? 0.4,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI response");
  return JSON.parse(content) as T;
}

async function callGeminiJson<T>(options: CallAIForJsonOptions): Promise<T> {
  const apiKey = getGeminiApiKey();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: options.userPrompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.4,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return JSON.parse(text) as T;
}

/** Call live AI and parse JSON — OpenAI first, Gemini fallback. */
export async function callAIForJson<T>(
  options: CallAIForJsonOptions
): Promise<T & { provider?: AIProvider }> {
  if (isOpenAIConfigured()) {
    try {
      const result = await withTimeout(callOpenAIJson<T>(options), AI_TIMEOUT_MS);
      return { ...result, provider: "openai" as const };
    } catch (openAiErr) {
      console.error("OpenAI failed, trying Gemini:", openAiErr);
      if (isGeminiConfigured()) {
        const result = await withTimeout(callGeminiJson<T>(options), AI_TIMEOUT_MS);
        return { ...result, provider: "gemini" as const };
      }
      throw openAiErr;
    }
  }

  if (isGeminiConfigured()) {
    const result = await withTimeout(callGeminiJson<T>(options), AI_TIMEOUT_MS);
    return { ...result, provider: "gemini" as const };
  }

  throw new Error("No AI API key configured");
}
