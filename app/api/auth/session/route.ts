import { NextResponse } from "next/server";
import { buildCookieHeader, forwardAuthRequest } from "@/lib/api/auth-proxy";
import {
  directSession,
  useDirectAuth,
  vercelSetupError,
} from "@/lib/auth/direct-auth";
import {
  AUTH_ROLE_COOKIE,
  AUTH_TOKEN_COOKIE,
  SESSION_COOKIE,
  clearSession,
} from "@/lib/auth/session";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get(AUTH_TOKEN_COOKIE)?.value;

    if (useDirectAuth()) {
      if (!token) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      const result = await directSession(token);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ user: result.user, token: result.token });
    }

    const cookieHeader = buildCookieHeader([
      { name: AUTH_TOKEN_COOKIE, value: token },
      { name: SESSION_COOKIE, value: jar.get(SESSION_COOKIE)?.value },
      { name: AUTH_ROLE_COOKIE, value: jar.get(AUTH_ROLE_COOKIE)?.value },
    ]);

    if (!cookieHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { res, data } = await forwardAuthRequest("/session", {
      method: "GET",
      cookieHeader,
    });

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: vercelSetupError() }, { status: 503 });
  }
}

export async function DELETE() {
  try {
    const jar = await cookies();
    const cookieHeader = buildCookieHeader([
      { name: AUTH_TOKEN_COOKIE, value: jar.get(AUTH_TOKEN_COOKIE)?.value },
      { name: SESSION_COOKIE, value: jar.get(SESSION_COOKIE)?.value },
    ]);

    if (cookieHeader && !useDirectAuth()) {
      await forwardAuthRequest("/session", {
        method: "DELETE",
        cookieHeader,
      }).catch(() => undefined);
    }

    await clearSession();
    return NextResponse.json({ success: true });
  } catch {
    await clearSession();
    return NextResponse.json({ success: true });
  }
}
