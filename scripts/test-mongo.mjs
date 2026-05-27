/**
 * Test MongoDB connection using .env.local settings.
 * Usage: npm run mongo:test
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filename) {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) return;
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
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const { resolveMongoUri } = await import(
  pathToFileURL(path.join(root, "lib", "mongo-uri.ts")).href
);

const uri = resolveMongoUri(process.env);
const redacted = uri.replace(/\/\/([^:@/]+):([^@/]+)@/, "//$1:***@");

const mongoose = (await import("mongoose")).default;

console.log(`Testing: ${redacted}`);

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const { db } = mongoose.connection;
  const collections = await db.listCollections().toArray();
  console.log("MongoDB connected successfully.");
  console.log(`  Database: ${db.databaseName}`);
  console.log(`  Collections: ${collections.length}`);
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error("MongoDB connection failed:", err.message);
  console.error(
    "\nFix checklist:\n" +
      "  Local:  install MongoDB Community Server and start the mongod service\n" +
      "  Atlas:  set MONGODB_URI or MONGODB_ATLAS_* in .env.local\n" +
      "          allow your IP in Atlas → Network Access (0.0.0.0/0 for dev)\n" +
      "  Then:   npm run seed && npm run dev\n"
  );
  process.exit(1);
}
