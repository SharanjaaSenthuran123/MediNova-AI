import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log("MongoDB connected (production mode — database required)");
  } catch (err) {
    console.error("\nFATAL: MongoDB connection failed. MediNova AI requires a database.");
    console.error("  Set MONGODB_URI in .env.local and ensure MongoDB Atlas/local is running.");
    console.error("  Then run: npm run seed\n");
    throw err;
  }
}

/** @deprecated Demo mode removed — always returns false when connected. */
export function isDemoMode(): boolean {
  return false;
}
