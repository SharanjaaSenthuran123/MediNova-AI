import type {
  AssistantContext,
  AssistantMessage,
  AssistantResponse,
} from "@/types/integrations";

const DISCLAIMER =
  "MediNova-AI assistant provides educational guidance only — not medical diagnosis. Consult a qualified healthcare professional for personal medical advice.";

function lastUserMessage(messages: AssistantMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") {
      return messages[i].content.toLowerCase();
    }
  }
  return "";
}

export function getDemoAssistantResponse(
  messages: AssistantMessage[],
  context?: AssistantContext
): AssistantResponse {
  const query = lastUserMessage(messages);
  const conditions = context?.possibleConditions?.join(", ") ?? "your recent symptoms";

  if (
    query.includes("when") &&
    (query.includes("doctor") || query.includes("see"))
  ) {
    const urgency = context?.urgency ?? "moderate";
    const timing =
      urgency === "emergency" || urgency === "high"
        ? "Seek care today — call your doctor or visit urgent care if symptoms are worsening."
        : urgency === "moderate"
          ? "Consider scheduling a visit within the next few days if symptoms persist."
          : "Monitor at home for 2–3 days; book a routine visit if symptoms don't improve.";
    return {
      message: `Based on ${conditions}, ${timing} Keep tracking fever, pain level, and any new warning signs.`,
      disclaimer: DISCLAIMER,
      source: "demo",
    };
  }

  if (
    query.includes("medicine") ||
    query.includes("medication") ||
    query.includes("drug")
  ) {
    return {
      message:
        "I can't recommend specific medications without a clinician's review. For over-the-counter options, follow label directions and check for interactions with medicines you're already taking. You can add reminders on the Reminders page after scanning a prescription or barcode.",
      disclaimer: DISCLAIMER,
      source: "demo",
    };
  }

  if (query.includes("reminder") || query.includes("forget")) {
    return {
      message:
        "Smart reminders in MediNova-AI can be created from your prescription OCR or barcode scan history. Visit Reminders to set morning, evening, or custom schedules — push and email are simulated in this demo.",
      disclaimer: DISCLAIMER,
      source: "demo",
    };
  }

  if (query.includes("appointment") || query.includes("book")) {
    return {
      message:
        "You can book a demo appointment from the Appointments page — choose virtual or in-person, pick a time slot, and get a prep checklist. In production this would connect to a clinic calendar API.",
      disclaimer: DISCLAIMER,
      source: "demo",
    };
  }

  if (context?.symptoms) {
    const tips =
      context.suggestions?.slice(0, 2).join(" ") ??
      "Rest, stay hydrated, and monitor how you feel over the next 24–48 hours.";
    return {
      message: `Regarding "${context.symptoms}" — possible considerations include ${conditions}. ${tips} Tell me if you'd like help deciding when to see a doctor or setting medicine reminders.`,
      disclaimer: DISCLAIMER,
      source: "demo",
    };
  }

  return {
    message:
      "I'm your MediNova-AI health assistant (demo). Ask follow-up questions about symptoms, when to seek care, medicine reminders, or booking appointments. I work best after a symptom check — try the Symptom Checker first.",
    disclaimer: DISCLAIMER,
    source: "demo",
  };
}
