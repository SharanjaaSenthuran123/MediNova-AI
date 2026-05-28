/**
 * Load MediNova env files for Node scripts (matches server load order).
 * First file to set a variable wins (same as dotenv default).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptsDir, "..");
const serverRoot = path.join(projectRoot, "server");

const ENV_FILES = [
  path.join(projectRoot, ".env.local"),
  path.join(projectRoot, ".env"),
  path.join(serverRoot, ".env.local"),
  path.join(serverRoot, ".env"),
];

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) return null;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

export function loadProjectEnv() {
  for (const filePath of ENV_FILES) {
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;
      if (process.env[parsed.key] === undefined) {
        process.env[parsed.key] = parsed.value;
      }
    }
  }
}

export { projectRoot, serverRoot };
