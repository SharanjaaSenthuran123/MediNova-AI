/**
 * Prepare for `npm run dev`: stop stale API listeners, clear web ports, verify .next cache.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { platform } from "os";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_URL = process.env.API_URL ?? "http://localhost:4000";

function portIsListening(port) {
  try {
    if (platform() === "win32") {
      const out = execSync(`netstat -ano -p tcp | findstr :${port}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      return out.includes("LISTENING");
    }
    execSync(`lsof -ti tcp:${port}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function isApiHealthy() {
  try {
    const res = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function killStaleApiIfNeeded() {
  if (!portIsListening(4000)) return;

  if (await isApiHealthy()) {
    console.log("Stopping existing API on port 4000 before restart...");
  } else {
    console.log("Port 4000 is stuck (not responding) — stopping stale process...");
  }

  delete process.env.MEDINOVA_KILL_PORTS;
  await import("./kill-dev-ports.mjs");
}

const nextDir = path.join(root, ".next");
const prodMarker = path.join(root, ".production-build");
const legacyProdMarker = path.join(nextDir, ".production-build");

function hasProductionBuild() {
  return fs.existsSync(prodMarker) || fs.existsSync(legacyProdMarker);
}

function hasMissingServerChunks() {
  const runtimePath = path.join(nextDir, "server", "webpack-runtime.js");
  if (!fs.existsSync(runtimePath)) return false;

  const runtime = fs.readFileSync(runtimePath, "utf8");
  const chunkNames = [
    ...runtime.matchAll(/["']\.\/(\d+\.js)["']/g),
    ...runtime.matchAll(/require\("\.\/(\d+\.js)"\)/g),
  ].map((match) => match[1]);

  const serverDir = path.join(nextDir, "server");
  return chunkNames.some(
    (chunk) => chunk && !fs.existsSync(path.join(serverDir, chunk))
  );
}

function isCorruptNextCache() {
  if (!fs.existsSync(nextDir)) return false;
  if (hasProductionBuild()) return true;

  const routesManifest = path.join(nextDir, "routes-manifest.json");
  const serverDir = path.join(nextDir, "server");
  const cacheDir = path.join(nextDir, "cache");

  if (
    (fs.existsSync(serverDir) || fs.existsSync(cacheDir)) &&
    !fs.existsSync(routesManifest)
  ) {
    return true;
  }

  return hasMissingServerChunks();
}

function removeNextCaches(reason) {
  console.log(reason);
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log("Removed .next");
  }
  for (const marker of [prodMarker, legacyProdMarker]) {
    if (fs.existsSync(marker)) {
      fs.rmSync(marker, { force: true });
    }
  }
  const nodeCache = path.join(root, "node_modules", ".cache");
  if (fs.existsSync(nodeCache)) {
    fs.rmSync(nodeCache, { recursive: true, force: true });
    console.log("Removed node_modules/.cache");
  }
}

console.log("Preparing dev environment...");
await killStaleApiIfNeeded();

process.env.MEDINOVA_KILL_PORTS = "web-only";
await import("./kill-dev-ports.mjs");

if (isCorruptNextCache()) {
  if (hasProductionBuild()) {
    removeNextCaches(
      "Found production build — clearing .next before dev."
    );
  } else if (
    fs.existsSync(nextDir) &&
    !fs.existsSync(path.join(nextDir, "routes-manifest.json"))
  ) {
    removeNextCaches(
      "Found broken .next cache (missing routes-manifest.json) — clearing before dev."
    );
  } else {
    removeNextCaches(
      "Found broken .next cache (missing webpack chunks) — clearing before dev."
    );
  }
} else {
  console.log("Dev cache OK.");
}

console.log("Ready to start API (4000) + Next.js (3000).\n");
