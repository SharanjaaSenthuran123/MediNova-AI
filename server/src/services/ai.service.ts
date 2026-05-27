import { env } from "../config/env.js";

export async function generateAIResponse(
  systemPrompt: string,
  userMessage: string,
  history: { role: string; content: string }[] = []
): Promise<{ content: string; source: "openai" | "demo" }> {
  if (!env.openaiKey) {
    return {
      content:
        "AI service is in demo mode. Connect OPENAI_API_KEY for live AI-generated recommendations.",
      source: "demo",
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.openaiModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...history.slice(-6),
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    return {
      content:
        data.choices?.[0]?.message?.content ??
        "Unable to generate response. Please try again.",
      source: "openai",
    };
  } catch {
    return {
      content: "AI service temporarily unavailable.",
      source: "demo",
    };
  }
}

export function parseJsonFromAI<T>(text: string, fallback: T): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) return fallback;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return fallback;
  }
}
