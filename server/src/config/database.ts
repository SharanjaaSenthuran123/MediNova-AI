import mongoose from "mongoose";
import { env } from "./env.js";

function redactMongoUri(uri: string): string {
  return uri.replace(/\/\/([^:@/]+):([^@/]+)@/, "//$1:***@");
}

function atlasHints(message: string): string[] {
  const hints: string[] = [];
  if (/authentication failed|bad auth|invalid credentials/i.test(message)) {
    hints.push(
      "Check Atlas username/password. Use MONGODB_ATLAS_* vars if the password contains @, #, or :."
    );
  }
  if (/timed out|server selection|ENOTFOUND|querySrv/i.test(message)) {
    hints.push("Check Atlas Network Access — allow your IP (0.0.0.0/0 for dev).");
  }
  if (/SSL|TLS|certificate/i.test(message)) {
    hints.push("Ensure you are using mongodb+srv:// for Atlas clusters.");
  }
  return hints;
}

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  const uri = env.mongoUri;
  const safeUri = redactMongoUri(uri);

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected — attempting to reconnect on next operation.");
  });

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
    });
    console.log("MongoDB Connected");
    console.log(`  ${safeUri}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("\nFATAL: MongoDB connection failed.");
    console.error(`  URI: ${safeUri}`);
    console.error(`  Error: ${message}`);

    if (uri.includes("mongodb+srv") || uri.includes("mongodb.net")) {
      console.error("\n  Atlas checklist:");
      console.error("    1. Cluster is running in MongoDB Atlas");
      console.error("    2. Database user exists with read/write access");
      console.error("    3. Your IP is allowed under Network Access");
      for (const hint of atlasHints(message)) {
        console.error(`    • ${hint}`);
      }
    } else {
      console.error("\n  Local checklist:");
      console.error("    1. MongoDB is installed and the mongod service is running");
      console.error("    2. MONGODB_URI in .env.local points to the correct host");
    }

    console.error("\n  Set MONGODB_URI or MONGODB_ATLAS_* in .env.local, then run: npm run mongo:test\n");
    throw err;
  }
}

/** @deprecated Demo mode removed — always returns false when connected. */
export function isDemoMode(): boolean {
  return false;
}
