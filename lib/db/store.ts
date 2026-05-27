import { promises as fs } from "fs";
import path from "path";
import type { DataStore, UserRecord } from "@/types/user";
import { normalizeUserRecord } from "@/lib/user-defaults";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

const emptyStore = (): DataStore => ({ users: {} });

/** In-memory fallback when file I/O is unavailable (e.g. read-only serverless). */
declare global {
  // eslint-disable-next-line no-var
  var __medinovaStore: DataStore | undefined;
}

function getMemoryStore(): DataStore {
  if (!global.__medinovaStore) {
    global.__medinovaStore = emptyStore();
  }
  return global.__medinovaStore;
}

async function readStore(): Promise<DataStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as DataStore;
  } catch {
    return getMemoryStore();
  }
}

async function writeStore(store: DataStore): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
    global.__medinovaStore = store;
  } catch {
    global.__medinovaStore = store;
  }
}

export async function getUserRecord(userId: string): Promise<UserRecord | null> {
  const store = await readStore();
  const record = store.users[userId];
  if (!record) return null;
  return normalizeUserRecord(record);
}

export async function saveUserRecord(
  userId: string,
  record: UserRecord
): Promise<UserRecord> {
  const store = await readStore();
  store.users[userId] = record;
  await writeStore(store);
  return record;
}

export async function deleteUserRecord(userId: string): Promise<void> {
  const store = await readStore();
  delete store.users[userId];
  await writeStore(store);
}

export function createUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEntryId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
