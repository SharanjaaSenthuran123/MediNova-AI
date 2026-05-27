import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/api/pharmacy/nearby${req.nextUrl.search}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Pharmacy API unavailable", pharmacies: [] },
      { status: 503 }
    );
  }
}
