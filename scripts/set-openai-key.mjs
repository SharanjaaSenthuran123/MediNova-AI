/**
 * Set OPENAI_API_KEY in .env.local from the command line.
 * Usage: npm run env:set -- sk-your-openai-key
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
const key = process.argv[2]?.trim().replace(/^["']|["']$/g, "");

if (!key || key === "your_openai_api_key_here" || !key.startsWith("sk-")) {
  console.error("Usage: npm run env:set -- sk-your-openai-api-key");
  console.error("Get a key at https://platform.openai.com/api-keys");
  process.exit(1);
}

const template = `# MediNova-AI — local environment (never commit)
OPENAI_API_KEY=${key}

# Optional:
# OPENAI_MODEL=gpt-4o-mini
`;

let content = template;
if (fs.existsSync(envPath)) {
  const existing = fs.readFileSync(envPath, "utf-8");
  if (/^\s*OPENAI_API_KEY\s*=/m.test(existing)) {
    content = existing.replace(
      /^\s*OPENAI_API_KEY\s*=.*$/m,
      `OPENAI_API_KEY=${key}`
    );
  } else {
    content = `${existing.trimEnd()}\nOPENAI_API_KEY=${key}\n`;
  }
}

fs.writeFileSync(envPath, content.replace(/\r\n/g, "\n").replace(/\r/g, "\n"), "utf-8");
console.log("Updated .env.local with your OpenAI API key.");
console.log("Restart the dev server: npm run dev");
