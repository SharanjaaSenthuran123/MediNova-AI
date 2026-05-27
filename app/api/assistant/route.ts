import { NextResponse } from "next/server";
import { getDemoAssistantResponse } from "@/lib/assistant-fallback";
import { isOpenAIConfigured } from "@/lib/env";
import { chatWithAssistant } from "@/lib/openai-assistant";
import type { AssistantContext, AssistantMessage } from "@/types/integrations";

function parseMessages(raw: unknown): AssistantMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const messages: AssistantMessage[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string" &&
      item.content.trim()
    ) {
      messages.push({ role: item.role, content: item.content.trim() });
    }
  }

  return messages.length > 0 ? messages : null;
}

function parseContext(raw: unknown): AssistantContext | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const ctx = raw as Record<string, unknown>;
  const context: AssistantContext = {};

  if (typeof ctx.symptoms === "string" && ctx.symptoms.trim()) {
    context.symptoms = ctx.symptoms.trim();
  }
  if (Array.isArray(ctx.possibleConditions)) {
    context.possibleConditions = ctx.possibleConditions.filter(
      (c): c is string => typeof c === "string" && c.trim().length > 0
    );
  }
  if (typeof ctx.urgency === "string" && ctx.urgency.trim()) {
    context.urgency = ctx.urgency.trim();
  }
  if (Array.isArray(ctx.suggestions)) {
    context.suggestions = ctx.suggestions.filter(
      (s): s is string => typeof s === "string" && s.trim().length > 0
    );
  }

  return Object.keys(context).length > 0 ? context : undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = parseMessages(body.messages);

    if (!messages) {
      return NextResponse.json(
        { error: "At least one message is required." },
        { status: 400 }
      );
    }

    const context = parseContext(body.context);

    if (!isOpenAIConfigured()) {
      const demo = getDemoAssistantResponse(messages, context);
      return NextResponse.json({
        ...demo,
        demoMode: true,
      });
    }

    try {
      const result = await chatWithAssistant(messages, context);
      return NextResponse.json({ ...result, demoMode: false });
    } catch (err) {
      console.error("OpenAI assistant failed:", err);
      const demo = getDemoAssistantResponse(messages, context);
      return NextResponse.json({
        ...demo,
        demoMode: true,
        error:
          "Live AI is temporarily unavailable — showing demo response. Check your API key and try again.",
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process assistant request." },
      { status: 500 }
    );
  }
}
