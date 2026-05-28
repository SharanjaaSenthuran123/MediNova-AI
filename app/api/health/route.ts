import "@/lib/env/runtime-env";
import { NextResponse } from "next/server";
import {
  checkMongoHealth,
  formatMongoError,
  useDirectAuth,
  vercelSetupError,
} from "@/lib/auth/direct-auth";
import { fetchApi, getApiUrl, isRemoteApiConfigured } from "@/lib/api/fetch-api";

/** Local health check — detects Express API or Vercel MongoDB auth mode. */
export const runtime = "nodejs";

export async function GET() {
  const API_URL = getApiUrl();

  if (isRemoteApiConfigured()) {
    try {
      const res = await fetchApi("/health", {}, 5000);
      if (res.ok) {
        const data = (await res.json()) as { ok?: boolean; service?: string };
        return NextResponse.json({
          ok: true,
          api: true,
          mongo: true,
          mode: "express",
          service: data.service ?? "medinova-api",
          url: API_URL,
        });
      }
      return NextResponse.json(
        {
          ok: false,
          api: false,
          error: `API returned ${res.status}`,
        },
        { status: 503 }
      );
    } catch {
      // fall through to MongoDB direct mode if configured
    }
  }

  if (useDirectAuth()) {
    const mongoCheck = await checkMongoHealth();
    if (mongoCheck.ok) {
      return NextResponse.json({
        ok: true,
        api: false,
        mongo: true,
        mode: "vercel-auth",
        hint:
          "Login works via MongoDB. Set API_URL to your deployed Express API for pharmacy, orders, and real-time features.",
      });
    }
    return NextResponse.json(
      {
        ok: false,
        api: false,
        mongo: false,
        error: mongoCheck.error,
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      api: false,
      mongo: false,
      error: vercelSetupError(),
    },
    { status: 503 }
  );
}
