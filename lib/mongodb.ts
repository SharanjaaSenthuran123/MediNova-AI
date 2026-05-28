import mongoose from "mongoose";
import { resolveMongoUri } from "./mongo-uri";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __medinovaMongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.__medinovaMongoose ?? {
  conn: null,
  promise: null,
};

if (!global.__medinovaMongoose) {
  global.__medinovaMongoose = cached;
}

function getMongoUri(): string {
  return resolveMongoUri(process.env);
}

/** Connect to MongoDB (cached for Next.js hot reload). Returns null if no URI is configured. */
export async function connectDB(): Promise<typeof mongoose | null> {
  const uri = getMongoUri();
  if (!uri.trim()) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 15000 })
      .then((conn) => {
        console.log("MongoDB Connected");
        return conn;
      })
      .catch((err: Error) => {
        cached.promise = null;
        console.error("MongoDB connection failed:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function isMongoConfigured(): boolean {
  const direct = process.env.MONGODB_URI?.trim();
  const hasAtlas = Boolean(
    process.env.MONGODB_ATLAS_CLUSTER?.trim() &&
      process.env.MONGODB_ATLAS_USER?.trim() &&
      process.env.MONGODB_ATLAS_PASSWORD !== undefined
  );
  return Boolean(direct || hasAtlas);
}
