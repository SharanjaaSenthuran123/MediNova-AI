/**
 * Stop dev servers and remove Next.js/webpack caches.
 * Always run this before restarting dev if you see missing chunk errors (e.g. ./331.js).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log("Stopping dev servers on common ports...");
await import("./kill-dev-ports.mjs");

const targets = [
  path.join(root, ".next"),
  path.join(root, "node_modules", ".cache"),
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`Removed ${path.relative(root, target)}`);
}

console.log("Dev cache cleared.");
