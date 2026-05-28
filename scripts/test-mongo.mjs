/**
 * Test MongoDB connection using .env.local / .env / server/.env settings.
 * Usage: npm run mongo:test
 */
import path from "path";
import { pathToFileURL } from "url";
import { loadProjectEnv, projectRoot } from "./load-env.mjs";

loadProjectEnv();

const { resolveMongoUri } = await import(
  pathToFileURL(path.join(projectRoot, "lib", "mongo-uri.ts")).href
);

const uri = resolveMongoUri(process.env);
const redacted = uri.replace(/\/\/([^:@/]+):([^@/]+)@/, "//$1:***@");

const mongoose = (await import("mongoose")).default;

console.log(`Testing: ${redacted}`);

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const { db } = mongoose.connection;
  const collections = await db.listCollections().toArray();
  console.log("MongoDB Connected");
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
