import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const configDir = path.dirname(fileURLToPath(import.meta.url));
export const serverRoot = path.resolve(configDir, "../..");
export const projectRoot = path.resolve(serverRoot, "..");

/** Load env files from project root and server folder (.env.local takes precedence). */
export function loadEnvFiles(): void {
  const files = [
    path.join(projectRoot, ".env.local"),
    path.join(projectRoot, ".env"),
    path.join(serverRoot, ".env.local"),
    path.join(serverRoot, ".env"),
  ];

  for (const file of files) {
    dotenv.config({ path: file });
  }
}
