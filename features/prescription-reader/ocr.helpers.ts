const MEDICINE_KEYWORDS = [
  "mg",
  "mcg",
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
];

const NOISE_PATTERNS = [
  /^rx$/i,
  /^dr\.?/i,
  /^patient/i,
  /^date/i,
  /^signature/i,
  /^license/i,
  /^address/i,
  /^phone/i,
  /^age/i,
];

export function cleanOCRText(raw: string): string {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export function extractMedicineNames(rawText: string): string[] {
  const lines = rawText
    .split(/[\n,;]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 2);

  const candidates = lines.filter((line) => {
    if (NOISE_PATTERNS.some((p) => p.test(line))) return false;
    const lower = line.toLowerCase();
    return (
      MEDICINE_KEYWORDS.some((kw) => lower.includes(kw)) ||
      /\d+\s*mg/i.test(line) ||
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+\d+/i.test(line)
    );
  });

  const unique = [...new Set(candidates.map((c) => normalizeMedicineLine(c)))];

  return unique.slice(0, 8);
}

function normalizeMedicineLine(line: string): string {
  return line
    .replace(/\s{2,}/g, " ")
    .replace(/^[\d.)]+\s*/, "")
    .trim();
}
