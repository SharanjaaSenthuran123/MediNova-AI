import { enrichSymptomResult } from "@/lib/symptom-utils";
import type { SymptomCheckRequest, SymptomCheckResult } from "@/types/symptom";

const DISCLAIMER =
  "MediNova-AI provides educational guidance only. This is not a medical diagnosis. Always consult a qualified healthcare professional.";

function withConfidence(
  names: string[],
  confidences: number[],
  rest: Omit<SymptomCheckResult, "possibleConditions" | "conditions">
): SymptomCheckResult {
  return enrichSymptomResult({
    ...rest,
    possibleConditions: names,
    conditions: names.map((name, i) => ({
      name,
      confidence: confidences[i] ?? Math.max(40, 75 - i * 12),
    })),
    source: "demo",
  });
}

export function getDemoSymptomResult(
  input: SymptomCheckRequest
): SymptomCheckResult {
  const text = input.symptoms.toLowerCase();
  const severe = input.severity === "severe";

  if (
    severe &&
    (text.includes("chest pain") ||
      text.includes("difficulty breathing") ||
      text.includes("can't breathe"))
  ) {
    return withConfidence(
      ["Possible cardiac or respiratory concern (requires urgent evaluation)"],
      [91],
      {
        urgency: "emergency",
        urgencyScore: 96,
        overallConfidence: 88,
        suggestions: [
          "Seek emergency care immediately or call your local emergency number.",
          "Do not drive yourself if you feel faint or short of breath.",
          "If alone, contact a trusted person while waiting for help.",
        ],
        seekDoctorIf: [
          "Chest pain, severe shortness of breath, or confusion",
          "Symptoms worsen rapidly",
          "You feel unsafe to wait",
        ],
        disclaimer: DISCLAIMER,
      }
    );
  }

  if (
    text.includes("fever") &&
    (text.includes("headache") || text.includes("cough"))
  ) {
    const urgency = severe
      ? "high"
      : input.severity === "moderate"
        ? "moderate"
        : "low";
    return withConfidence(
      [
        "Viral upper respiratory infection",
        "Influenza-like illness",
        "Seasonal allergy flare (less likely with fever)",
      ],
      [82, 71, 44],
      {
        urgency,
        suggestions: [
          "Rest and stay hydrated; monitor temperature every 4–6 hours.",
          "Use acetaminophen or ibuprofen only as directed on the label.",
          "Isolate if contagious symptoms are present; wear a mask around others.",
        ],
        seekDoctorIf: [
          "Fever above 103°F (39.4°C) or lasting more than 3 days",
          "Difficulty breathing, chest pain, or confusion",
          "Symptoms worsen after initial improvement",
        ],
        disclaimer: DISCLAIMER,
      }
    );
  }

  if (text.includes("headache") && !text.includes("fever")) {
    return withConfidence(
      [
        "Tension headache",
        "Dehydration-related headache",
        "Migraine (if throbbing or with light sensitivity)",
      ],
      [78, 62, 51],
      {
        urgency: severe ? "moderate" : "low",
        suggestions: [
          "Drink water and rest in a quiet, dim room.",
          "Apply a cool compress to your forehead.",
          "Limit screen time and caffeine if symptoms persist.",
        ],
        seekDoctorIf: [
          "Sudden worst headache of your life",
          "Headache with fever, stiff neck, or vision changes",
          "Headache after a head injury",
        ],
        disclaimer: DISCLAIMER,
      }
    );
  }

  if (text.includes("cough") || text.includes("sore throat")) {
    return withConfidence(
      ["Common cold", "Bronchitis (mild)", "Allergic rhinitis"],
      [76, 58, 42],
      {
        urgency: severe ? "moderate" : "low",
        suggestions: [
          "Warm fluids and honey (if age-appropriate) may soothe throat irritation.",
          "Use a humidifier and avoid smoke or strong irritants.",
          "Track cough duration and any colored phlegm.",
        ],
        seekDoctorIf: [
          "Cough lasting more than 2–3 weeks",
          "High fever, wheezing, or blood in sputum",
          "Difficulty swallowing or breathing",
        ],
        disclaimer: DISCLAIMER,
      }
    );
  }

  return withConfidence(
    [
      "Non-specific symptoms — further evaluation may be needed",
      "Stress or fatigue-related discomfort",
      "Mild self-limiting illness",
    ],
    [65, 52, 45],
    {
      urgency: severe ? "moderate" : "low",
      suggestions: [
        "Track symptoms daily (severity, triggers, duration).",
        "Maintain sleep, hydration, and balanced meals.",
        "Avoid self-medicating beyond OTC label directions.",
      ],
      seekDoctorIf: [
        "Symptoms persist beyond 7 days or worsen",
        "New severe symptoms develop",
        "You are unsure about safe next steps",
      ],
      disclaimer: DISCLAIMER,
    }
  );
}
