import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

/** Proxies authenticated reports requests to Express + MongoDB. */
export async function GET(request: Request) {
  try {
    const res = await fetch(`${API_URL}/api/reports`, {
      cache: "no-store",
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Reports API unavailable" }, { status: 503 });
  }
}
