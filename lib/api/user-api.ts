import {
  createEmptyUserRecord,
  formatProfileValidationError,
  initialsFromName,
} from "@/lib/db/user-profile";
import {
  createUserId,
  deleteUserRecord,
  getUserRecord,
  saveUserRecord,
} from "@/lib/db/store";
import {
  clearSession,
  getAuthToken,
  getSessionUserId,
  setSessionUserId,
} from "@/lib/auth/session";
import { cookies } from "next/headers";
import { userProfileSchema, emergencyContactsSchema } from "@/lib/schemas/user";
import type { StoredEmergencyContact, UserProfile } from "@/types/user";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

function mapApiUser(raw: Record<string, unknown>): UserProfile {
  return {
    id: String(raw.id),
    name: String(raw.name),
    email: String(raw.email),
    age: typeof raw.age === "number" ? raw.age : undefined,
    gender: typeof raw.gender === "string" ? raw.gender : undefined,
    avatarInitials: String(raw.avatarInitials ?? "U"),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
  };
}

async function proxyToApi(
  path: string,
  init: RequestInit & { cookieHeader?: string }
) {
  const headers = new Headers(init.headers);
  if (init.cookieHeader) {
    headers.set("Cookie", init.cookieHeader);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { res, data };
}

export async function fetchCurrentUser(cookieHeader?: string): Promise<UserProfile | null> {
  const hasAuthToken = cookieHeader
    ? cookieHeader.includes("medinova_token=")
    : Boolean(await getAuthToken());

  if (hasAuthToken) {
    const resolvedHeader =
      cookieHeader ??
      (await cookies())
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    const { res, data } = await proxyToApi("/api/user", {
      method: "GET",
      cookieHeader: resolvedHeader,
    });
    if (res.ok && data.user && typeof data.user === "object") {
      return mapApiUser(data.user as Record<string, unknown>);
    }
    if (res.status === 401) {
      await clearSession();
    }
  }

  const userId = await getSessionUserId();
  if (!userId) return null;

  const record = await getUserRecord(userId);
  return record?.profile ?? null;
}

export async function createDemoProfile(body: unknown) {
  const parsed = userProfileSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      error: formatProfileValidationError(parsed.error.flatten().fieldErrors),
    };
  }

  const userId = createUserId();
  const now = new Date().toISOString();
  const profile: UserProfile = {
    id: userId,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    age: parsed.data.age,
    gender: parsed.data.gender,
    avatarInitials: initialsFromName(parsed.data.name),
    createdAt: now,
    updatedAt: now,
  };

  await saveUserRecord(userId, createEmptyUserRecord(profile));
  await setSessionUserId(userId);

  return { ok: true as const, user: profile };
}

export async function updateDemoProfile(body: unknown) {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false as const, status: 401, error: "Create a profile first." };
  }

  const record = await getUserRecord(userId);
  if (!record) {
    return { ok: false as const, status: 404, error: "Profile not found" };
  }

  const parsed = userProfileSchema.safeParse({
    ...record.profile,
    ...(typeof body === "object" && body !== null ? body : {}),
  });
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      error: formatProfileValidationError(parsed.error.flatten().fieldErrors),
    };
  }

  const profile: UserProfile = {
    ...record.profile,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    age: parsed.data.age,
    gender: parsed.data.gender,
    avatarInitials: initialsFromName(parsed.data.name),
    updatedAt: new Date().toISOString(),
  };

  await saveUserRecord(userId, { ...record, profile });
  return { ok: true as const, user: profile };
}

export async function deleteDemoProfile() {
  const userId = await getSessionUserId();
  if (userId) {
    await deleteUserRecord(userId);
  }
  await clearSession();
}

export async function getDemoContacts() {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false as const, status: 401, error: "Create a profile first." };
  }

  const record = await getUserRecord(userId);
  if (!record) {
    return { ok: false as const, status: 404, error: "Profile not found" };
  }

  return { ok: true as const, contacts: record.emergencyContacts ?? [] };
}

export async function saveDemoContacts(body: unknown) {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false as const, status: 401, error: "Create a profile first." };
  }

  const record = await getUserRecord(userId);
  if (!record) {
    return { ok: false as const, status: 404, error: "Profile not found" };
  }

  const contactsInput =
    typeof body === "object" && body !== null && "contacts" in body
      ? (body as { contacts: unknown }).contacts
      : undefined;

  const parsed = emergencyContactsSchema.safeParse(contactsInput);
  if (!parsed.success) {
    return { ok: false as const, status: 400, error: "Invalid contacts" };
  }

  const contacts: StoredEmergencyContact[] = parsed.data.map((contact, index) => ({
    id: contact.id ?? `contact_${Date.now()}_${index}`,
    name: contact.name,
    relation: contact.relation,
    phone: contact.phone,
    email: contact.email || undefined,
    status: "active",
  }));

  await saveUserRecord(userId, { ...record, emergencyContacts: contacts });
  return { ok: true as const, contacts };
}

export async function handleUserMutation(
  method: "POST" | "PATCH" | "DELETE",
  body: unknown,
  cookieHeader: string
) {
  const hasAuthToken = cookieHeader.includes("medinova_token=");

  if (hasAuthToken) {
    const { res, data } = await proxyToApi("/api/user", {
      method,
      cookieHeader,
      body: method === "DELETE" ? undefined : JSON.stringify(body),
    });

    if (res.ok) {
      if (method === "DELETE") {
        await clearSession();
        return { ok: true as const, status: res.status, success: true };
      }

      if (data.user && typeof data.user === "object") {
        return {
          ok: true as const,
          status: res.status,
          user: mapApiUser(data.user as Record<string, unknown>),
        };
      }
    }

    if (res.status === 401) {
      await clearSession();
      if (method === "POST") {
        const demo = await createDemoProfile(body);
        if (!demo.ok) return demo;
        return { ok: true as const, status: 200, user: demo.user };
      }
      if (method === "DELETE") {
        return { ok: true as const, status: 200, success: true };
      }
    }

    return {
      ok: false as const,
      status: res.status,
      error: typeof data.error === "string" ? data.error : "Failed to save profile",
    };
  }

  if (method === "POST") {
    const result = await createDemoProfile(body);
    if (!result.ok) return result;
    return { ok: true as const, status: 200, user: result.user };
  }

  if (method === "PATCH") {
    const result = await updateDemoProfile(body);
    if (!result.ok) return result;
    return { ok: true as const, status: 200, user: result.user };
  }

  await deleteDemoProfile();
  return { ok: true as const, status: 200, success: true };
}

export async function handleContactsRequest(
  method: "GET" | "PUT",
  body: unknown,
  cookieHeader: string
) {
  const hasAuthToken = cookieHeader.includes("medinova_token=");

  if (hasAuthToken) {
    const { res, data } = await proxyToApi("/api/user/contacts", {
      method,
      cookieHeader,
      body: method === "PUT" ? JSON.stringify(body) : undefined,
    });

    if (res.ok) {
      return {
        ok: true as const,
        status: res.status,
        contacts: Array.isArray(data.contacts) ? data.contacts : [],
      };
    }

    if (res.status === 401) {
      await clearSession();
      if (method === "GET") {
        const demo = await getDemoContacts();
        if (!demo.ok) return demo;
        return { ok: true as const, status: 200, contacts: demo.contacts };
      }
    }

    return {
      ok: false as const,
      status: res.status,
      error: typeof data.error === "string" ? data.error : "Failed to save contacts",
    };
  }

  if (method === "GET") {
    const result = await getDemoContacts();
    if (!result.ok) return result;
    return { ok: true as const, status: 200, contacts: result.contacts };
  }

  const result = await saveDemoContacts(body);
  if (!result.ok) return result;
  return { ok: true as const, status: 200, contacts: result.contacts };
}
