import { NextResponse } from "next/server";
import { fetchApi, getApiUrl } from "@/lib/api/fetch-api";

/** Local health check — not proxied; used to detect if Express API is reachable. */
export async function GET() {
  const API_URL = getApiUrl();
  try {
    const res = await fetchApi("/health", {}, 5000);

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
