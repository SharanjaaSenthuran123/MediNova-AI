import { NextRequest, NextResponse } from "next/server";

/** City-level location from client IP when browser GPS is coarse (common on laptops). */
export async function GET(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "";

  try {
    const url = ip && ip !== "::1" && ip !== "127.0.0.1"
      ? `https://ipwho.is/${encodeURIComponent(ip)}`
      : "https://ipwho.is/";

    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "IP lookup failed" }, { status: 502 });
    }

    const data = (await res.json()) as {
      success?: boolean;
      latitude?: number;
      longitude?: number;
      city?: string;
      region?: string;
      country?: string;
    };

    if (!data.success || data.latitude == null || data.longitude == null) {
      return NextResponse.json({ error: "IP location unavailable" }, { status: 404 });
    }

    const address = [data.city, data.region, data.country].filter(Boolean).join(", ");

    return NextResponse.json({
      lat: data.latitude,
      lng: data.longitude,
      address,
      accuracy: 5000,
      source: "approximate",
    });
  } catch {
    return NextResponse.json({ error: "IP lookup failed" }, { status: 502 });
  }
}
