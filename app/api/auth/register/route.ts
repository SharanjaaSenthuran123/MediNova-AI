import { NextResponse } from "next/server";
import { forwardAuthRequest } from "@/lib/api/auth-proxy";
import { setAuthCookies } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
    return NextResponse.json(
      {
        error:
          "Cannot reach the MediNova API. Run npm run dev from the project root and ensure MongoDB is running.",
      },
      { status: 503 }
    );
  }
}
