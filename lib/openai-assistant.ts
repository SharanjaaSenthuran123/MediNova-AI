import OpenAI from "openai";
import { getOpenAIApiKey, getOpenAIModel, isOpenAIConfigured, refreshEnvCache } from "@/lib/env";
import type {
  AssistantContext,
  AssistantMessage,
  AssistantResponse,
} from "@/types/integrations";

const SYSTEM_PROMPT = `You are MediNova-AI's health assistant (educational demo only).
- Never diagnose or prescribe. Use calm, concise language (2-4 sentences).
- Encourage professional care for red flags.
- You may discuss self-care, when to seek care, reminders, and appointments conceptually.
- End every reply with practical next steps when relevant.`;

function buildContextBlock(context?: AssistantContext): string {
  if (!context?.symptoms) return "";

  const parts = [
    `Recent symptom check:`,
    `- Symptoms: ${context.symptoms}`,
    context.possibleConditions?.length
      ? `- Possible conditions (educational): ${context.possibleConditions.join(", ")}`
      : null,
    context.urgency ? `- Urgency: ${context.urgency}` : null,
    context.suggestions?.length
      ? `- Prior suggestions: ${context.suggestions.join("; ")}`
      : null,
  ].filter(Boolean);

  return parts.join("\n");
}

export async function chatWithAssistant(
  messages: AssistantMessage[],
  context?: AssistantContext
): Promise<AssistantResponse> {
  refreshEnvCache();
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const client = new OpenAI({ apiKey: getOpenAIApiKey() });
  const contextBlock = buildContextBlock(context);

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: contextBlock
        ? `${SYSTEM_PROMPT}\n\nPatient context:\n${contextBlock}`
        : SYSTEM_PROMPT,
    },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const completion = await client.chat.completions.create({
    model: getOpenAIModel(),
    messages: openaiMessages,
    temperature: 0.4,
    max_tokens: 400,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  return {
    message: content,
    disclaimer:
      "MediNova-AI assistant provides educational guidance only — not medical diagnosis.",
    source: "openai",
  };
}
