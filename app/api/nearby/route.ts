export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchNearbyPlaces } from "@/lib/nearby/providers";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(500).max(20000).optional(),
  type: z
    .enum(["all", "hospital", "pharmacy", "clinic", "lab", "blood_bank", "ambulance"])
    .optional(),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid lat/lng parameters", places: [] },
      { status: 400 }
    );
  }

  const { lat, lng, radius = 10000, type = "all" } = parsed.data;

  try {
    let { places, source } = await searchNearbyPlaces(lat, lng, radius, API_URL);

    if (places.length === 0 && radius < 15000) {
      const wider = await searchNearbyPlaces(lat, lng, 15000, API_URL);
      places = wider.places;
      source = wider.source;
    }

    if (type !== "all") {
      places = places.filter((p) => p.type === type);
    }

    if (places.length === 0) {
      return NextResponse.json({
        places: [],
        source,
        error:
          "No facilities found nearby. Set your location on the map and try again.",
      });
    }

    return NextResponse.json({ places, source });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Nearby search failed";
    return NextResponse.json({ error: message, places: [] }, { status: 500 });
  }
}
