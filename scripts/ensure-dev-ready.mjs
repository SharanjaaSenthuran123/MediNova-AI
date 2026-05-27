/**
 * Prepare for `next dev`: stop stale servers and remove broken or production .next caches.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

console.log("Checking dev cache...");
// Do not kill port 4000 — API starts in parallel via `npm run dev`.
process.env.MEDINOVA_KILL_PORTS = "web-only";
await import("./kill-dev-ports.mjs");

if (isCorruptNextCache()) {
  if (hasProductionBuild()) {
    removeNextCaches(
      "Found production build — stopping dev conflict: clearing .next before dev."
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
