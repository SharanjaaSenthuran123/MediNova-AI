/**
 * Verify production build exists before `next start`.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = path.join(root, ".next");
const routesManifest = path.join(nextDir, "routes-manifest.json");

if (!fs.existsSync(routesManifest)) {
  console.error(
    "\nNo production build found (.next/routes-manifest.json missing).\n" +
      "Run: npm run build\n" +
      "Then: npm start\n"
  );
  process.exit(1);
}

console.log("Production build OK.");
