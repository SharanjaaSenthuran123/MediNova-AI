import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  suburb?: string;
  neighbourhood?: string;
  village?: string;
  city?: string;
  town?: string;
  city_district?: string;
  state_district?: string;
  state?: string;
  country?: string;
};

function formatAddress(data: {
  display_name?: string;
  address?: NominatimAddress;
}): string {
  const a = data.address;
  if (a) {
    const line1 = [a.house_number, a.road ?? a.pedestrian ?? a.footway]
      .filter(Boolean)
      .join(" ");
    const line2 = [a.suburb ?? a.neighbourhood ?? a.village, a.city ?? a.town ?? a.city_district]
      .filter(Boolean)
      .join(", ");
    const line3 = [a.state_district ?? a.state, a.country].filter(Boolean).join(", ");
    const parts = [line1, line2, line3].filter((part) => part && part.length > 0);
    if (parts.length > 0) return parts.join(", ");
  }
  return data.display_name ?? "";
}

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const { lat, lng } = parsed.data;
  const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "MediNova-AI/1.0 (healthcare app)",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ address: fallback });
    }

    const data = (await res.json()) as {
      display_name?: string;
      address?: NominatimAddress;
    };
    const address = formatAddress(data) || fallback;
    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ address: fallback });
  }
}
