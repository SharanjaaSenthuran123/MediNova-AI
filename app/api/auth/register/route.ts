import { NextResponse } from "next/server";
import { forwardAuthRequest } from "@/lib/api/auth-proxy";
import {
  directRegister,
  useDirectAuth,
  vercelSetupError,
} from "@/lib/auth/direct-auth";
import { setAuthCookies } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (useDirectAuth()) {
      const result = await directRegister(body);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      await setAuthCookies({
        userId: result.user.id,
        token: result.token,
        role: result.user.role,
      });
      return NextResponse.json({ user: result.user, token: result.token });
    }

    const { res, data } = await forwardAuthRequest("/register", {
      method: "POST",
      json: body,
    });

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const user = data.user as { id: string; role: string } | undefined;
    const token = data.token as string | undefined;

    if (user?.id && token && user.role) {
      await setAuthCookies({
        userId: user.id,
        token,
        role: user.role,
      });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: vercelSetupError() }, { status: 503 });
  }
}
