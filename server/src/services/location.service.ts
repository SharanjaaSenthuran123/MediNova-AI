/** Haversine distance in kilometers between two GPS coordinates. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface RankedLocation<T> {
  item: T;
  distanceKm: number;
}

/** Sort items by distance from origin; items without coords sort last. */
export function rankByDistance<T extends { lat?: number; lng?: number }>(
  origin: GeoPoint,
  items: T[]
): RankedLocation<T>[] {
  return items
    .map((item) => ({
      item,
      distanceKm:
        item.lat != null && item.lng != null
          ? haversineKm(origin.lat, origin.lng, item.lat, item.lng)
          : Infinity,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function nearest<T extends { lat?: number; lng?: number }>(
  origin: GeoPoint,
  items: T[]
): RankedLocation<T> | null {
  const ranked = rankByDistance(origin, items);
  return ranked[0]?.distanceKm !== Infinity ? ranked[0] : null;
}
