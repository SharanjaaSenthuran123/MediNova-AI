/**
 * Fix empty / misnamed Vercel env vars and push production values.
 * Usage: node scripts/fix-vercel-env.mjs [--atlas-uri "mongodb+srv://..."]
 */
import fs from "fs";
import path from "path";
import { execSync, spawnSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTION_URL = "https://medi-nova-ai-2fqi.vercel.app";
const atlasArg =
  process.argv.find((a) => a.startsWith("--atlas-uri="))?.slice(12)?.trim() ??
  (process.argv.includes("--atlas-uri")
    ? process.argv[process.argv.indexOf("--atlas-uri") + 1]
    : "");

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
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Write-Output '${value.replace(/'/g, "''")}' | npx vercel env add ${key} ${target} --force`,
    ],
    { cwd: root, encoding: "utf-8", shell: false, stdio: ["pipe", "pipe", "pipe"] }
  );
  if (result.status !== 0) {
    throw new Error(
      `Failed to set ${key}: ${result.stderr || result.stdout || "unknown error"}`
    );
  }
}

function ensureLinked() {
  if (fs.existsSync(path.join(root, ".vercel", "project.json"))) return;
  execSync("npx vercel link --yes --project medi-nova-ai-2fqi --scope sharanjaa-s-projects", {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
}

const localEnv = loadEnvFile(".env.local");
Object.assign(process.env, localEnv);

if (atlasArg) {
  upsertEnvLocal("MONGODB_URI", atlasArg);
  process.env.MONGODB_URI = atlasArg;
}

const { resolveMongoUri } = await import(
  pathToFileURL(path.join(root, "lib", "mongo-uri.ts")).href
);

const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret) {
  console.error("JWT_SECRET missing in .env.local");
  process.exit(1);
}

const mongoUri = resolveMongoUri(process.env);
const cloudMongo = mongoUri && !/127\.0\.0\.1|localhost/i.test(mongoUri);

console.log("Fixing Vercel env for medi-nova-ai-2fqi...\n");
ensureLinked();

const vars = {
  JWT_SECRET: jwtSecret,
  CLIENT_URL: PRODUCTION_URL,
};

if (cloudMongo) {
  vars.MONGODB_URI = mongoUri;
  if (process.env.MONGODB_ATLAS_USER?.trim()) {
    vars.MONGODB_ATLAS_USER = process.env.MONGODB_ATLAS_USER.trim();
  }
  if (process.env.MONGODB_ATLAS_PASSWORD !== undefined) {
    vars.MONGODB_ATLAS_PASSWORD = process.env.MONGODB_ATLAS_PASSWORD;
  }
  if (process.env.MONGODB_ATLAS_CLUSTER?.trim()) {
    vars.MONGODB_ATLAS_CLUSTER = process.env.MONGODB_ATLAS_CLUSTER.trim();
  }
  if (process.env.MONGODB_DB?.trim()) {
    vars.MONGODB_DB = process.env.MONGODB_DB.trim();
  }
}

if (process.env.OPENAI_API_KEY?.trim()) {
  vars.OPENAI_API_KEY = process.env.OPENAI_API_KEY.trim();
}

const apiUrl = process.env.API_URL?.trim();
if (apiUrl && !/localhost|127\.0\.0\.1/i.test(apiUrl)) {
  vars.API_URL = apiUrl;
  vars.NEXT_PUBLIC_SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || apiUrl;
}

try {
  for (const target of ["production", "preview"]) {
    for (const [key, value] of Object.entries(vars)) {
      vercelEnvAdd(key, value, target);
    }
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

if (!cloudMongo) {
  console.warn(`
WARNING: No cloud MongoDB URI found locally.
Login on Vercel still needs Atlas. Run:

  npm run vercel:fix -- --atlas-uri "mongodb+srv://USER:PASS@CLUSTER.mongodb.net/medinova"
  npm run seed
`);
} else {
  console.log("\nMongoDB Atlas URI pushed to Vercel.");
}

console.log("\nRedeploying production...");
execSync("npx vercel --prod --yes", { cwd: root, stdio: "inherit", shell: true });
console.log("\nDone. Test: https://medi-nova-ai-2fqi.vercel.app/api/health");
