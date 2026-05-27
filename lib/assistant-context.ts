import type { AssistantContext } from "@/types/integrations";
import type { SymptomCheckResult } from "@/types/symptom";

const STORAGE_KEY = "medinova_assistant_context";

export function saveAssistantContext(
  symptoms: string,
  result: SymptomCheckResult
): void {
  if (typeof window === "undefined") return;
  const context: AssistantContext = {
    symptoms,
    possibleConditions: result.possibleConditions,
    urgency: result.urgency,
    suggestions: result.suggestions,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
}

export function loadAssistantContext(): AssistantContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AssistantContext;
  } catch {
    return null;
  }
}

export function clearAssistantContext(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
