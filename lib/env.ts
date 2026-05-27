import { existsSync, readFileSync } from "fs";
import path from "path";

const PLACEHOLDER_KEYS = new Set([
  "",
  "your_openai_api_key_here",
  "sk-your-key-here",
  "sk-your-openai-key-here",
]);

export type OpenAIConfigStatus =
  | "configured"
  | "missing_env_file"
  | "missing_key"
  | "placeholder_key";

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Parse .env.local / .env without relying solely on Next.js boot-time injection. */
function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};

  try {
    const raw = stripBom(readFileSync(filePath, "utf-8"));
    const vars: Record<string, string> = {};

    // Split on \r\n, \n, or lone \r (some editors save comment+key on one line with \r only).
    for (const line of raw.split(/\r\n|\n|\r/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;

      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      } else {
        const comment = value.indexOf(" #");
        if (comment !== -1) value = value.slice(0, comment).trim();
      }

      vars[key] = value;
    }

    return vars;
  } catch {
    return {};
  }
}

function loadEnvFiles(): Record<string, string> {
  const root = process.cwd();
  return {
    ...parseEnvFile(path.join(root, ".env")),
    ...parseEnvFile(path.join(root, ".env.local")),
    ...parseEnvFile(path.join(root, ".env.development.local")),
  };
}

function normalizeApiKey(raw: string | undefined): string {
  if (!raw) return "";
  return raw.trim().replace(/^["']|["']$/g, "");
}

function isRealKey(key: string): boolean {
  return Boolean(key && !PLACEHOLDER_KEYS.has(key));
}

let cachedFileEnv: Record<string, string> | null = null;

function getFileEnv(): Record<string, string> {
  if (!cachedFileEnv) {
    cachedFileEnv = loadEnvFiles();
  }
  return cachedFileEnv;
}

/** Re-read .env.local (call after user updates the file in dev). */
export function refreshEnvCache(): void {
  cachedFileEnv = null;
}

export function getOpenAIApiKey(): string {
  const candidates = [
    normalizeApiKey(process.env.OPENAI_API_KEY),
    normalizeApiKey(getFileEnv().OPENAI_API_KEY),
    normalizeApiKey(getFileEnv().OPENAI_KEY),
  ];

  return candidates.find(isRealKey) ?? candidates.find(Boolean) ?? "";
}

export function getOpenAIConfigStatus(): OpenAIConfigStatus {
  const key = getOpenAIApiKey();
  const envLocalPath = path.join(process.cwd(), ".env.local");
  const envFileExists = existsSync(envLocalPath);

  if (isRealKey(key)) {
    return "configured";
  }

  if (!envFileExists) {
    return "missing_env_file";
  }

  const fileKey = normalizeApiKey(getFileEnv().OPENAI_API_KEY);
  if (!fileKey && !normalizeApiKey(process.env.OPENAI_API_KEY)) {
    return "missing_key";
  }

  return "placeholder_key";
}

export function isOpenAIConfigured(): boolean {
  return getOpenAIConfigStatus() === "configured";
}

export function getGeminiApiKey(): string {
  const candidates = [
    normalizeApiKey(process.env.GEMINI_API_KEY),
    normalizeApiKey(getFileEnv().GEMINI_API_KEY),
  ];
  return candidates.find(isRealKey) ?? candidates.find(Boolean) ?? "";
}

export function isGeminiConfigured(): boolean {
  return isRealKey(getGeminiApiKey());
}

export function isAnyAIConfigured(): boolean {
  return isOpenAIConfigured() || isGeminiConfigured();
}

export function getOpenAIModel(): string {
  const fromProcess = process.env.OPENAI_MODEL?.trim();
  const fromFile = getFileEnv().OPENAI_MODEL?.trim();
  return fromProcess || fromFile || "gpt-4o-mini";
}

export function getOpenAIConfigHint(): string {
  switch (getOpenAIConfigStatus()) {
    case "configured":
      return "";
    case "missing_env_file":
      return "Create .env.local in the project root: OPENAI_API_KEY=sk-... then run npm run dev.";
    case "missing_key":
      return "Add OPENAI_API_KEY=sk-... to .env.local (no spaces around =), save the file, then restart npm run dev.";
    case "placeholder_key":
      return "Your .env.local still contains the placeholder text. Replace OPENAI_API_KEY=your_openai_api_key_here with your real sk-... key, save, then restart npm run dev. Or run: npm run env:set -- sk-your-key";
    default:
      return "Configure OPENAI_API_KEY in .env.local for live AI.";
  }
}

export function getOpenAIConfigDebug(): {
  envFileExists: boolean;
  processEnvSet: boolean;
  fileEnvSet: boolean;
  processIsPlaceholder: boolean;
  fileIsPlaceholder: boolean;
} {
  refreshEnvCache();
  const processKey = normalizeApiKey(process.env.OPENAI_API_KEY);
  const fileKey = normalizeApiKey(getFileEnv().OPENAI_API_KEY);
  const envLocalPath = path.join(process.cwd(), ".env.local");

  return {
    envFileExists: existsSync(envLocalPath),
    processEnvSet: Boolean(processKey),
    fileEnvSet: Boolean(fileKey),
    processIsPlaceholder: Boolean(processKey && PLACEHOLDER_KEYS.has(processKey)),
    fileIsPlaceholder: Boolean(fileKey && PLACEHOLDER_KEYS.has(fileKey)),
  };
}
