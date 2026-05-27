/**
 * Full dev reset: stop servers, delete .next, start API + Next.js together.
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log("Stopping dev servers and clearing cache...");
await import("./clean-dev-cache.mjs");

console.log("Starting API (port 4000) + Next.js (port 3000)...\n");
const child = spawn("npm", ["run", "dev"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
