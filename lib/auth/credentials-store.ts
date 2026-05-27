import { promises as fs } from "fs";
import path from "path";
import { createUserId } from "@/lib/db/store";
import { hashPassword } from "@/lib/auth/password";
import type { AuthCredential, UserRole } from "@/types/auth";

const DATA_DIR = path.join(process.cwd(), ".data");
const AUTH_PATH = path.join(DATA_DIR, "auth.json");

interface AuthStore {
  credentials: AuthCredential[];
}

declare global {
  // eslint-disable-next-line no-var
  var __medinovaAuth: AuthStore | undefined;
}

function getMemoryStore(): AuthStore {
  if (!global.__medinovaAuth) {
    global.__medinovaAuth = { credentials: seedDemoCredentials() };
  }
  return global.__medinovaAuth;
}

function seedDemoCredentials(): AuthCredential[] {
  const demoPassword = hashPassword("demo123");
  return [
    {
      userId: "demo_patient",
      email: "patient@medinova.ai",
      passwordHash: demoPassword,
      role: "patient",
      name: "Alex Rivera",
    },
    {
      userId: "demo_doctor",
      email: "doctor@medinova.ai",
      passwordHash: demoPassword,
      role: "doctor",
      name: "Dr. Priya Nair",
    },
    {
      userId: "demo_admin",
      email: "admin@medinova.ai",
      passwordHash: demoPassword,
      role: "admin",
      name: "Admin User",
    },
  ];
}

async function readStore(): Promise<AuthStore> {
  try {
    const raw = await fs.readFile(AUTH_PATH, "utf-8");
    const parsed = JSON.parse(raw) as AuthStore;
    if (parsed.credentials.length === 0) {
      parsed.credentials = seedDemoCredentials();
    }
    return parsed;
  } catch {
    return getMemoryStore();
  }
}

async function writeStore(store: AuthStore): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(AUTH_PATH, JSON.stringify(store, null, 2), "utf-8");
    global.__medinovaAuth = store;
  } catch {
    global.__medinovaAuth = store;
  }
}

export async function findCredentialByEmail(
  email: string
): Promise<AuthCredential | null> {
  const store = await readStore();
  return (
    store.credentials.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    ) ?? null
  );
}

export async function createCredential(input: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): Promise<AuthCredential> {
  const store = await readStore();
  const existing = store.credentials.find(
    (c) => c.email.toLowerCase() === input.email.toLowerCase()
  );
  if (existing) {
    throw new Error("Email already registered");
  }

  const credential: AuthCredential = {
    userId: createUserId(),
    email: input.email.toLowerCase(),
    passwordHash: hashPassword(input.password),
    role: input.role,
    name: input.name,
  };

  store.credentials.push(credential);
  await writeStore(store);
  return credential;
}

export async function updatePassword(
  email: string,
  password: string
): Promise<void> {
  const store = await readStore();
  const credential = store.credentials.find(
    (c) => c.email.toLowerCase() === email.toLowerCase()
  );
  if (!credential) throw new Error("User not found");
  credential.passwordHash = hashPassword(password);
  await writeStore(store);
}
