/**
 * Push production env vars to Vercel from .env.local.
 * Requires: npx vercel login && npx vercel link (once)
 *
 * Usage:
 *   npm run vercel:setup
 *   npm run vercel:setup -- --atlas-uri "mongodb+srv://user:pass@cluster.mongodb.net/medinova"
 */
import fs from "fs";
import path from "path";
import { execSync, spawnSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTION_URL = "https://medi-nova-ai-2fqi.vercel.app";
const atlasArg = process.argv.find((a) => a.startsWith("--atlas-uri="))?.slice(12)?.trim()
  ?? (process.argv.includes("--atlas-uri") ? process.argv[process.argv.indexOf("--atlas-uri") + 1] : "");

function loadEnvFile(filename) {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
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
    }
    env[key] = value;
  }
  return env;
}

function isCloudMongoUri(uri) {
  return Boolean(uri?.trim()) && !/127\.0\.0\.1|localhost/i.test(uri);
}

function upsertEnvLocal(key, value) {
  const envPath = path.join(root, ".env.local");
  let lines = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf-8").split(/\r?\n/)
    : [];
  const idx = lines.findIndex((line) => line.startsWith(`${key}=`) && !line.startsWith("#"));
  const entry = `${key}=${value}`;
  if (idx >= 0) lines[idx] = entry;
  else lines.push(entry);
  fs.writeFileSync(envPath, `${lines.join("\n").replace(/\n+$/, "")}\n`, "utf-8");
}

function vercelEnvAdd(key, value, target = "production") {
  console.log(`  → ${key} (${target})`);
  const result = spawnSync(
    "npx",
    ["vercel", "env", "add", key, target, "--force"],
    {
      cwd: root,
      input: value,
      encoding: "utf-8",
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    }
  );
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`Failed to set ${key} on Vercel`);
  }
}

function ensureVercelCli() {
  try {
    execSync("npx vercel whoami", { cwd: root, stdio: "pipe", shell: true });
  } catch {
    console.error(
      "Not logged in to Vercel. Run:\n  npx vercel login\n  npx vercel link\nThen run this script again."
    );
    process.exit(1);
  }
}

const localEnv = loadEnvFile(".env.local");
Object.assign(process.env, localEnv);

const { resolveMongoUri } = await import(
  pathToFileURL(path.join(root, "lib", "mongo-uri.ts")).href
);

if (atlasArg) {
  upsertEnvLocal("MONGODB_URI", atlasArg);
  process.env.MONGODB_URI = atlasArg;
  console.log("Saved Atlas URI to .env.local for local + Vercel sync.");
}

const mongoUri = resolveMongoUri(process.env);
const jwtSecret = process.env.JWT_SECRET?.trim();

if (!isCloudMongoUri(mongoUri)) {
  console.error(`
MongoDB Atlas is required for Vercel (local mongodb://127.0.0.1 will not work in the cloud).

1. Create a free cluster: https://www.mongodb.com/cloud/atlas
2. Get your connection string (Network Access → allow 0.0.0.0/0 for dev)
3. Run:

   npm run vercel:setup -- --atlas-uri "mongodb+srv://USER:PASS@CLUSTER.mongodb.net/medinova"

4. Then seed Atlas: npm run seed
`);
  process.exit(1);
}

if (!jwtSecret) {
  console.error("JWT_SECRET is missing in .env.local — add it before running vercel:setup.");
  process.exit(1);
}

console.log("Vercel production setup");
console.log(`  Site: ${PRODUCTION_URL}`);
console.log(`  MongoDB: ${mongoUri.replace(/\/\/([^:@/]+):([^@/]+)@/, "//$1:***@")}\n`);

ensureVercelCli();

const vars = {
  MONGODB_URI: mongoUri,
  JWT_SECRET: jwtSecret,
  CLIENT_URL: PRODUCTION_URL,
};

const apiUrl = process.env.API_URL?.trim();
if (apiUrl && !/localhost|127\.0\.0\.1/i.test(apiUrl)) {
  vars.API_URL = apiUrl;
  vars.NEXT_PUBLIC_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || apiUrl;
}

if (process.env.OPENAI_API_KEY?.trim()) {
  vars.OPENAI_API_KEY = process.env.OPENAI_API_KEY.trim();
}

try {
  for (const [key, value] of Object.entries(vars)) {
    vercelEnvAdd(key, value, "production");
    vercelEnvAdd(key, value, "preview");
  }
  console.log("\nEnvironment variables pushed to Vercel.");
  console.log("Redeploy: npx vercel --prod");
  console.log("Or trigger redeploy from the Vercel dashboard (Deployments → Redeploy).");
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
