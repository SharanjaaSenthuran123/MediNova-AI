/**
 * Mark that .next contains a production build (used by ensure-dev-ready).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
fs.writeFileSync(path.join(root, ".production-build"), new Date().toISOString());
console.log("Marked production build.");
