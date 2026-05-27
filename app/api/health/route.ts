import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

/** Local health check — not proxied; used to detect if Express API is reachable. */
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          api: false,
          error: `API returned ${res.status}`,
        },
        { status: 503 }
      );
    }

    const data = (await res.json()) as { ok?: boolean; service?: string };
    return NextResponse.json({
      ok: true,
      api: true,
      service: data.service ?? "medinova-api",
      url: API_URL,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        api: false,
        error:
          "Cannot reach Express API on port 4000. Run npm run dev from the project root.",
      },
      { status: 503 }
    );
  }
}
