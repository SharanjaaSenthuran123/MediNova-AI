import { cookies } from "next/headers";

export const SESSION_COOKIE = "medinova_uid";
export const AUTH_TOKEN_COOKIE = "medinova_token";
export const AUTH_ROLE_COOKIE = "medinova_role";

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function getAuthToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

export async function getAuthRole(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_ROLE_COOKIE)?.value ?? null;
}

export async function setSessionUserId(
  userId: string,
  options?: { maxAge?: number }
): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: options?.maxAge ?? 60 * 60 * 24 * 365,
  });
}

export async function setAuthCookies(input: {
  userId: string;
  token: string;
  role: string;
  remember?: boolean;
}): Promise<void> {
  const maxAge = input.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, input.userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  jar.set(AUTH_TOKEN_COOKIE, input.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  jar.set(AUTH_ROLE_COOKIE, input.role, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(AUTH_TOKEN_COOKIE);
  jar.delete(AUTH_ROLE_COOKIE);
}
