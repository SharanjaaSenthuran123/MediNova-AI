import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

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

/** Connect to MongoDB (cached for Next.js hot reload). Returns null if MONGODB_URI is unset. */
export async function connectDB(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function isMongoConfigured(): boolean {
  return Boolean(MONGODB_URI?.trim());
}
