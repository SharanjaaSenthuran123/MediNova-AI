import { prescriptionSamples } from "@/data/prescriptionSamples";
import type { DetectedMedicine, MedicineConfidence, OCRResult } from "@/types/medicine";

export type OCRStage =
  | "idle"
  | "loading-engine"
  | "loading-language"
  | "recognizing"
  | "complete";

export interface OCRProgressState {
  progress: number;
  stage: OCRStage;
  stageLabel: string;
}

export interface TextSegment {
  text: string;
  highlight: boolean;
}

const MEDICINE_KEYWORDS = [
  "mg",
  "mcg",
  "ml",
  "g",
  "tablet",
  "tablets",
  "capsule",
  "capsules",
  "syrup",
  "injection",
  "drops",
  "cream",
  "ointment",
  "suspension",
  "inhaler",
  "patch",
];

const NOISE_PATTERNS = [
  /^rx[:\s]/i,
  /^rx\.?$/i,
  /^dr\.?/i,
  /^patient/i,
  /^date/i,
  /^signature/i,
  /^license/i,
  /^address/i,
  /^phone/i,
  /^age/i,
  /^refill/i,
  /^contact/i,
  /^take with/i,
  /^finish full/i,
];

const DOSAGE_PATTERN =
  /(\d+\s*(?:mg|mcg|ml|g)\b(?:\s*[-–]\s*[^,;\n]+)?|\d+\s*(?:tablet|capsule|cap)s?\s+[^,;\n]+|(?:once|twice|three times)\s+(?:daily|a day)[^,;\n]*)/i;

const STAGE_LABELS: Record<OCRStage, string> = {
  idle: "Ready to scan",
  "loading-engine": "Loading OCR engine…",
  "loading-language": "Loading language model…",
  recognizing: "Recognizing text…",
  complete: "Scan complete",
};

export function cleanOCRText(raw: string): string {
  return raw
    .replace(/\r/g, "")
    .replace(/[|]/g, "I")
    .replace(/(\d)[oO][oO](\s*mg\b)/gi, "$100$2")
    .replace(/(\d)[oO](\s*mg\b)/gi, "$10$2")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

const INSTRUCTION_PATTERNS = [
  /^(?:\d+\s*)?(?:capsule|tablet|cap|tab)s?\s+\d/i,
  /^(?:once|twice|three times)\s/i,
  /^(?:take|finish|refill|contact)\s/i,
  /\b(?:as needed|at bedtime|with food|with meals)\b/i,
];

export function extractMedicineNames(rawText: string): DetectedMedicine[] {
  const normalized = rawText.replace(/\r/g, "");
  const lines = normalized
    .split(/[\n;]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 2);

  const candidates = lines.filter((line) => {
    if (NOISE_PATTERNS.some((p) => p.test(line))) return false;
    if (INSTRUCTION_PATTERNS.some((p) => p.test(line)) && !/\d+\s*mg/i.test(line)) {
      return false;
    }
    const lower = line.toLowerCase();
    return (
      MEDICINE_KEYWORDS.some((kw) => lower.includes(kw)) ||
      /\d+\s*mg/i.test(line) ||
      /^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+\d+/i.test(line)
    );
  });

  const parsed = candidates.map(parseMedicineLine);

  const seen = new Set<string>();
  const unique: DetectedMedicine[] = [];

  for (const med of parsed) {
    const key = med.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(med);
  }

  return unique.slice(0, 8);
}

function parseMedicineLine(line: string): DetectedMedicine {
  let working = line
    .replace(/\s{2,}/g, " ")
    .replace(/^[\d.)]+\s*/, "")
    .trim();

  let instructionHint: string | undefined;
  const emDashParts = working.split(/\s(?:—|–)\s/);
  if (emDashParts.length > 1) {
    working = emDashParts[0].trim();
    instructionHint = emDashParts.slice(1).join(" — ").trim();
  }

  const dosageMatch = working.match(DOSAGE_PATTERN);
  let dosageHint = dosageMatch?.[0]?.trim() ?? instructionHint;

  let name = working;
  if (dosageMatch) {
    name = working.replace(dosageMatch[0], "").replace(/\s*[-–]\s*$/, "").trim();
  }

  if (!name) name = working;

  return {
    name: capitalizeMedicineName(name),
    dosageHint,
    confidence: scoreConfidence(working, dosageHint),
  };
}

function capitalizeMedicineName(name: string): string {
  const words = name.split(/\s+/);
  return words
    .map((w) => {
      if (/^\d/.test(w) || /mg|mcg|ml$/i.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function scoreConfidence(line: string, dosageHint?: string): MedicineConfidence {
  const lower = line.toLowerCase();
  const hasDose = Boolean(dosageHint) || /\d+\s*mg/i.test(line);
  const hasForm = MEDICINE_KEYWORDS.some((kw) => lower.includes(kw));

  if (hasDose && hasForm) return "high";
  if (hasDose || hasForm) return "medium";
  return "low";
}

export function getDemoOCRResult(sampleIndex = 0): OCRResult {
  const sample = prescriptionSamples[sampleIndex] ?? prescriptionSamples[0];
  const rawText = cleanOCRText(sample.rawText);
  return {
    rawText,
    medicines: extractMedicineNames(rawText),
    source: "demo",
  };
}

export function mapTesseractStatus(status: string, progress: number): OCRProgressState {
  const lower = status.toLowerCase();

  if (lower.includes("recognizing")) {
    return {
      stage: "recognizing",
      stageLabel: STAGE_LABELS.recognizing,
      progress: Math.round(35 + progress * 65),
    };
  }
  if (lower.includes("loading language") || lower.includes("traineddata")) {
    return {
      stage: "loading-language",
      stageLabel: STAGE_LABELS["loading-language"],
      progress: 25,
    };
  }
  if (lower.includes("initializing") || lower.includes("loading tesseract")) {
    return {
      stage: "loading-engine",
      stageLabel: STAGE_LABELS["loading-engine"],
      progress: 12,
    };
  }

  return {
    stage: "loading-engine",
    stageLabel: STAGE_LABELS["loading-engine"],
    progress: 8,
  };
}

export function getMedicineHighlightTerms(medicines: DetectedMedicine[]): string[] {
  const terms = new Set<string>();

  for (const med of medicines) {
    terms.add(med.name);
    med.name.split(/\s+/).forEach((word) => {
      if (word.length > 3) terms.add(word);
    });
    if (med.dosageHint) {
      const doseMatch = med.dosageHint.match(/\d+\s*(?:mg|mcg|ml|g)\b/i);
      if (doseMatch) terms.add(doseMatch[0]);
    }
  }

  return [...terms].sort((a, b) => b.length - a.length);
}

export function segmentTextWithHighlights(
  text: string,
  terms: string[]
): TextSegment[] {
  if (terms.length === 0) {
    return [{ text, highlight: false }];
  }

  const pattern = new RegExp(
    `(${terms.map((t) => escapeRegex(t)).join("|")})`,
    "gi"
  );

  const parts = text.split(pattern);
  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      highlight: terms.some((term) => part.toLowerCase() === term.toLowerCase()),
    }));
}

export function averageMedicineConfidence(medicines: DetectedMedicine[]): number {
  if (medicines.length === 0) return 0;
  const scores = { high: 92, medium: 68, low: 42 };
  const total = medicines.reduce((sum, m) => sum + scores[m.confidence], 0);
  return Math.round(total / medicines.length);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
