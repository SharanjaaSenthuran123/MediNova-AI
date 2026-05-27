/** Shared nearby healthcare search providers for /api/nearby */

export type FacilityType =
  | "hospital"
  | "pharmacy"
  | "clinic"
  | "lab"
  | "blood_bank"
  | "ambulance";

export interface NearbyPlace {
  id: string;
  name: string;
  type: FacilityType;
  distanceKm: number;
  address: string;
  lat: number;
  lng: number;
  source?: string;
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function dedupePlaces(places: NearbyPlace[]): NearbyPlace[] {
  const seen = new Set<string>();
  const out: NearbyPlace[] = [];
  for (const p of places.sort((a, b) => a.distanceKm - b.distanceKm)) {
    const key = `${p.name.toLowerCase()}|${p.lat.toFixed(4)}|${p.lng.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out.slice(0, 40);
}

function mapPhotonType(
  osmKey?: string,
  osmValue?: string,
  defaultType: FacilityType = "clinic"
): FacilityType {
  const val = (osmValue ?? "").toLowerCase();

  if (val.includes("hospital")) return "hospital";
  if (val.includes("pharmacy") || val.includes("chemist")) return "pharmacy";
  if (val.includes("blood")) return "blood_bank";
  if (val.includes("ambulance")) return "ambulance";
  if (val.includes("laboratory") || val.includes("lab")) return "lab";
  if (
    val.includes("clinic") ||
    val.includes("doctor") ||
    val.includes("dentist") ||
    val.includes("physio")
  ) {
    return "clinic";
  }
  if (osmKey === "amenity" || osmKey === "healthcare" || osmKey === "office") {
    return defaultType;
  }
  return defaultType;
}

function formatPhotonAddress(props: Record<string, string | undefined>): string {
  const parts = [props.street, props.housenumber, props.city, props.state, props.country]
    .filter(Boolean)
    .map(String);
  return parts.join(", ") || "Address unavailable";
}

const PHOTON_QUERIES: { q: string; type: FacilityType }[] = [
  { q: "hospital", type: "hospital" },
  { q: "clinic", type: "clinic" },
  { q: "pharmacy", type: "pharmacy" },
  { q: "doctor", type: "clinic" },
];

/** Primary provider — Komoot Photon (fast, no API key). */
export async function fetchFromPhoton(
  lat: number,
  lng: number,
  radiusM: number
): Promise<NearbyPlace[]> {
  const radiusKm = radiusM / 1000;
  const maxDistanceKm = radiusKm * 1.2;

  const results = await Promise.allSettled(
    PHOTON_QUERIES.map(async ({ q, type }) => {
      const url = new URL("https://photon.komoot.io/api/");
      url.searchParams.set("q", q);
      url.searchParams.set("lat", String(lat));
      url.searchParams.set("lon", String(lng));
      url.searchParams.set("limit", "10");

      const res = await fetch(url.toString(), {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [] as NearbyPlace[];

      const data = (await res.json()) as {
        features?: Array<{
          geometry: { coordinates: [number, number] };
          properties: Record<string, string | undefined> & {
            osm_id?: number;
            osm_type?: string;
            osm_key?: string;
            osm_value?: string;
            name?: string;
          };
        }>;
      };

      return (data.features ?? [])
        .map((f): NearbyPlace | null => {
          const [flng, flat] = f.geometry.coordinates;
          const props = f.properties;
          const name = props.name?.trim();
          if (!name) return null;
          if (props.osm_key === "highway" || props.osm_key === "place") return null;
          if (/ (street|road|lane)$/i.test(name)) return null;

          const distanceKm = haversineKm(lat, lng, flat, flng);
          if (distanceKm > maxDistanceKm) return null;

          return {
            id: `photon-${props.osm_type ?? "n"}-${props.osm_id ?? `${flat}-${flng}`}`,
            name,
            type: mapPhotonType(props.osm_key, props.osm_value, type),
            distanceKm,
            address: formatPhotonAddress(props),
            lat: flat,
            lng: flng,
            source: "photon",
          } satisfies NearbyPlace;
        })
        .filter((p) => p != null);
    })
  );

  const merged: NearbyPlace[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") merged.push(...r.value);
  }
  return dedupePlaces(merged);
}

/** MediNova pharmacy catalog from Express API. */
export async function fetchFromDbPharmacies(
  lat: number,
  lng: number,
  apiUrl: string
): Promise<NearbyPlace[]> {
  try {
    const res = await fetch(
      `${apiUrl}/api/pharmacy/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];

    const data = (await res.json()) as {
      pharmacies?: Array<{
        _id: string;
        name: string;
        address: string;
        city?: string;
        lat: number;
        lng: number;
        distanceKm?: number;
      }>;
    };

    return (data.pharmacies ?? []).map((p) => ({
      id: `db-pharmacy-${p._id}`,
      name: p.name,
      type: "pharmacy" as const,
      distanceKm: p.distanceKm ?? haversineKm(lat, lng, p.lat, p.lng),
      address: [p.address, p.city].filter(Boolean).join(", "),
      lat: p.lat,
      lng: p.lng,
      source: "medinova",
    }));
  } catch {
    return [];
  }
}

const OVERPASS_ENDPOINTS = [
  "https://lz4.overpass-api.de/api/interpreter",
  "https://z.overpass-api.de/api/interpreter",
];

function resolveOverpassType(tags: Record<string, string>): FacilityType {
  const amenity = tags.amenity ?? "";
  const healthcare = tags.healthcare ?? "";
  if (amenity === "hospital" || healthcare === "hospital") return "hospital";
  if (amenity === "pharmacy" || healthcare === "pharmacy") return "pharmacy";
  if (amenity === "blood_bank" || healthcare === "blood_donation") return "blood_bank";
  if (amenity === "ambulance_station") return "ambulance";
  if (amenity === "laboratory" || healthcare === "laboratory") return "lab";
  return "clinic";
}

/** Optional Overpass fallback — short timeout, nodes only. */
export async function fetchFromOverpass(
  lat: number,
  lng: number,
  radiusM: number
): Promise<NearbyPlace[]> {
  const query = `[out:json][timeout:12];(node["amenity"~"hospital|pharmacy|clinic|doctors|dentist|blood_bank|ambulance_station|laboratory"](around:${radiusM},${lat},${lng}););out body 35;`;
  const body = `data=${encodeURIComponent(query)}`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;

      const data = (await res.json()) as {
        elements?: Array<{
          id: number;
          lat?: number;
          lon?: number;
          tags?: Record<string, string>;
        }>;
      };

      const places = (data.elements ?? [])
        .map((el): NearbyPlace | null => {
          const tags = el.tags ?? {};
          const name = tags.name ?? tags.brand ?? tags.operator;
          if (!name || el.lat == null || el.lon == null) return null;
          return {
            id: `osm-node-${el.id}`,
            name,
            type: resolveOverpassType(tags),
            distanceKm: haversineKm(lat, lng, el.lat, el.lon),
            address:
              [tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", ") ||
              "Address unavailable",
            lat: el.lat,
            lng: el.lon,
            source: "openstreetmap",
          } satisfies NearbyPlace;
        })
        .filter((p) => p != null);

      if (places.length > 0) return dedupePlaces(places);
    } catch {
      continue;
    }
  }
  return [];
}

export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  radiusM: number,
  apiUrl: string
): Promise<{ places: NearbyPlace[]; source: string }> {
  const [db, photon] = await Promise.allSettled([
    fetchFromDbPharmacies(lat, lng, apiUrl),
    fetchFromPhoton(lat, lng, radiusM),
  ]);

  let merged = dedupePlaces([
    ...(db.status === "fulfilled" ? db.value : []),
    ...(photon.status === "fulfilled" ? photon.value : []),
  ]);

  let overpassUsed = false;
  if (merged.length < 5) {
    const overpass = await fetchFromOverpass(lat, lng, radiusM);
    if (overpass.length > 0) {
      merged = dedupePlaces([...merged, ...overpass]);
      overpassUsed = true;
    }
  }

  const sources = [
    db.status === "fulfilled" && db.value.length > 0 ? "medinova" : null,
    photon.status === "fulfilled" && photon.value.length > 0 ? "photon" : null,
    overpassUsed ? "openstreetmap" : null,
  ].filter(Boolean);

  return {
    places: merged,
    source: sources.length > 0 ? sources.join("+") : "none",
  };
}
