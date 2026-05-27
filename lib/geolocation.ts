export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  label?: string;
  address?: string;
  source?: "gps" | "approximate" | "saved" | "manual" | "fallback" | "default";
}

export type LocationErrorCode =
  | "insecure"
  | "unavailable"
  | "denied"
  | "timeout"
  | "unknown";

export class LocationError extends Error {
  code: LocationErrorCode;

  constructor(message: string, code: LocationErrorCode) {
    super(message);
    this.name = "LocationError";
    this.code = code;
  }
}

const APPROXIMATE_ACCURACY_METERS = 500;
/** Browser fixes above this are too coarse — prefer IP city estimate instead. */
const VERY_COARSE_ACCURACY_METERS = 2500;
const GOOD_ENOUGH_ACCURACY_METERS = 150;

export function isApproximateLocation(location: GeoLocation): boolean {
  if (location.source === "manual" || location.source === "saved") return false;
  return (
    location.source === "approximate" ||
    (location.accuracy != null && location.accuracy > APPROXIMATE_ACCURACY_METERS)
  );
}

export function isTrustedLocation(location: GeoLocation): boolean {
  return (
    location.source === "manual" ||
    location.source === "saved" ||
    (location.source === "gps" &&
      location.accuracy != null &&
      location.accuracy <= APPROXIMATE_ACCURACY_METERS)
  );
}

export function formatAccuracyMeters(accuracy?: number): string | null {
  if (accuracy == null || !Number.isFinite(accuracy)) return null;
  if (accuracy >= 1000) return `±${(accuracy / 1000).toFixed(1)} km (network estimate)`;
  return `±${Math.round(accuracy)} m`;
}

export function getLocationQualityWarning(location: GeoLocation): string | null {
  if (isTrustedLocation(location)) return null;
  if (location.source === "fallback" || location.source === "default") {
    return "Set your location using the button below or drag the pin on the map.";
  }
  if (isApproximateLocation(location)) {
    return "Location is approximate. Drag the pin on the map to your exact address for accurate nearby results.";
  }
  return null;
}

function classifyGpsSource(accuracy?: number): GeoLocation["source"] {
  if (accuracy == null || accuracy > APPROXIMATE_ACCURACY_METERS) return "approximate";
  return "gps";
}

const STORAGE_KEY = "medinova_saved_location";

/** Default map center — override with NEXT_PUBLIC_DEFAULT_LAT / NEXT_PUBLIC_DEFAULT_LNG */
function defaultFallbackLocation(): GeoLocation {
  const lat = Number(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? 6.9271);
  const lng = Number(process.env.NEXT_PUBLIC_DEFAULT_LNG ?? 79.8612);
  return {
    lat,
    lng,
    label: "Default area — tap Set current location",
    source: "fallback",
  };
}

export function canUseGeolocation(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof navigator !== "undefined" &&
    !!navigator.geolocation
  );
}

export function getLocationHelpText(code?: LocationErrorCode): string {
  switch (code) {
    case "insecure":
      return "Open the app at http://localhost:3000 (not an IP address) or use HTTPS — browsers block GPS on insecure pages.";
    case "denied":
      return "Location is blocked. Click the lock icon in your address bar → Site settings → Location → Allow, then try again.";
    case "timeout":
      return "GPS timed out. Move near a window, enable device location services, and try again.";
    case "unavailable":
      return "This device or browser does not support location services.";
    default:
      return "Could not get your location. Tap Set current location and allow access when prompted.";
  }
}

export async function getGeolocationPermission(): Promise<
  "granted" | "denied" | "prompt" | "unknown"
> {
  if (!canUseGeolocation()) return "unknown";
  try {
    const result = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });
    return result.state as "granted" | "denied" | "prompt";
  } catch {
    return "unknown";
  }
}

function mapGeolocationError(err: GeolocationPositionError): LocationError {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return new LocationError(err.message || "Location permission denied", "denied");
    case err.POSITION_UNAVAILABLE:
      return new LocationError(err.message || "Location unavailable", "unavailable");
    case err.TIMEOUT:
      return new LocationError(err.message || "Location request timed out", "timeout");
    default:
      return new LocationError(err.message || "Could not get location", "unknown");
  }
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

async function fetchIpLocation(): Promise<GeoLocation | null> {
  try {
    const res = await fetch("/api/geocode/ip", {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      lat: number;
      lng: number;
      address?: string;
      accuracy?: number;
    };
    if (typeof data.lat !== "number" || typeof data.lng !== "number") return null;
    return {
      lat: data.lat,
      lng: data.lng,
      address: data.address,
      accuracy: data.accuracy ?? 5000,
      source: "approximate",
      label: data.address,
    };
  } catch {
    return null;
  }
}

/** When browser GPS is very coarse (laptops), cross-check with IP city location. */
async function refineLocation(fix: GeoLocation): Promise<GeoLocation> {
  if (fix.accuracy != null && fix.accuracy <= APPROXIMATE_ACCURACY_METERS) {
    return fix;
  }

  const ip = await fetchIpLocation();
  if (!ip) return fix;

  const distKm = haversineKm(fix.lat, fix.lng, ip.lat, ip.lng);

  if (fix.accuracy == null || fix.accuracy > VERY_COARSE_ACCURACY_METERS || distKm > 80) {
    return {
      ...ip,
      label: ip.address ?? ip.label,
      source: "approximate",
    };
  }

  return fix;
}

function readPosition(
  highAccuracy: boolean,
  maxAge: number,
  timeout: number
): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: classifyGpsSource(pos.coords.accuracy),
        }),
      (err) => reject(mapGeolocationError(err)),
      { enableHighAccuracy: highAccuracy, timeout, maximumAge: maxAge }
    );
  });
}

/** Collects GPS fixes for up to `timeoutMs` and returns the most accurate one. */
function watchBestPosition(timeoutMs: number): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    let best: GeoLocation | null = null;
    let settled = false;

    const finish = (result: GeoLocation | null, err?: LocationError) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      navigator.geolocation.clearWatch(watchId);
      if (result) resolve(result);
      else reject(err ?? new LocationError("Location request timed out", "timeout"));
    };

    const timer = setTimeout(() => finish(best), timeoutMs);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const fix: GeoLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: classifyGpsSource(pos.coords.accuracy),
        };
        if (!best || (fix.accuracy ?? Infinity) < (best.accuracy ?? Infinity)) {
          best = fix;
        }
        if (fix.accuracy != null && fix.accuracy <= GOOD_ENOUGH_ACCURACY_METERS) {
          finish(fix);
        }
      },
      (err) => finish(best, mapGeolocationError(err)),
      { enableHighAccuracy: true, maximumAge: 0, timeout: timeoutMs }
    );
  });
}

export async function getUserLocation(options?: {
  highAccuracy?: boolean;
  fresh?: boolean;
}): Promise<GeoLocation> {
  if (typeof window === "undefined") {
    throw new LocationError("Geolocation is not available on the server", "unavailable");
  }

  if (!window.isSecureContext) {
    throw new LocationError(
      "Geolocation requires HTTPS or localhost — use http://localhost:3000",
      "insecure"
    );
  }

  if (!navigator.geolocation) {
    throw new LocationError("Geolocation is not supported in this browser", "unavailable");
  }

  const permission = await getGeolocationPermission();
  if (permission === "denied") {
    throw new LocationError("Location permission denied in browser settings", "denied");
  }

  if (options?.highAccuracy || options?.fresh) {
    try {
      return await refineLocation(await watchBestPosition(30000));
    } catch (err) {
      if (err instanceof LocationError && err.code === "denied") throw err;
      try {
        return await refineLocation(await readPosition(true, 0, 25000));
      } catch {
        const ip = await fetchIpLocation();
        if (ip) return ip;
        throw err;
      }
    }
  }

  try {
    return await refineLocation(await readPosition(true, 0, 15000));
  } catch (first) {
    if (first instanceof LocationError && first.code === "denied") throw first;
    try {
      return await refineLocation(await readPosition(true, 0, 25000));
    } catch {
      const ip = await fetchIpLocation();
      if (ip) return ip;
      throw first;
    }
  }
}

export async function getBrowserLocation(): Promise<GeoLocation> {
  return getUserLocation();
}

export function saveLocationLocally(location: GeoLocation): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        label: location.label,
        source: location.source,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    /* ignore quota errors */
  }
}

export function getSavedLocation(): GeoLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GeoLocation;
    if (typeof data.lat !== "number" || typeof data.lng !== "number") return null;
    return { ...data, source: data.source ?? "saved" };
  } catch {
    return null;
  }
}

async function fetchProfileLocation(): Promise<GeoLocation | null> {
  try {
    const res = await fetch("/api/user", { credentials: "include", cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      user?: { location?: { lat: number; lng: number; address?: string } | null };
    };
    const loc = data.user?.location;
    if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return null;
    return {
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address,
      source: "saved" as const,
    };
  } catch {
    return null;
  }
}

/**
 * Resolves location without requiring a user gesture:
 * saved profile → localStorage → GPS (if allowed) → regional default.
 */
export async function resolveDeliveryLocation(options?: {
  preferGps?: boolean;
}): Promise<GeoLocation> {
  if (options?.preferGps && canUseGeolocation()) {
    try {
      const gps = await getUserLocation();
      const address = await reverseGeocode(gps.lat, gps.lng).catch(() => undefined);
      const resolved = {
        ...gps,
        address,
        label: address ?? `GPS · ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`,
      };
      saveLocationLocally(resolved);
      return resolved;
    } catch {
      /* fall through */
    }
  }

  const profile = await fetchProfileLocation();
  if (profile) {
    const address =
      profile.address ??
      (await reverseGeocode(profile.lat, profile.lng).catch(() => undefined));
    const resolved = {
      ...profile,
      address,
      label: address ?? profile.label ?? "Saved location",
      source: "saved" as const,
    };
    saveLocationLocally(resolved);
    return resolved;
  }

  const cached = getSavedLocation();
  if (cached) {
    if (cached.source === "manual" || cached.source === "saved") {
      const address =
        cached.address ??
        (await reverseGeocode(cached.lat, cached.lng).catch(() => undefined));
      return { ...cached, address, label: address ?? cached.label ?? "Saved location" };
    }
    if (
      cached.source === "gps" &&
      cached.accuracy != null &&
      cached.accuracy <= APPROXIMATE_ACCURACY_METERS
    ) {
      const address =
        cached.address ??
        (await reverseGeocode(cached.lat, cached.lng).catch(() => undefined));
      return { ...cached, address, label: address ?? cached.label ?? "Saved location" };
    }
  }

  if (canUseGeolocation()) {
    try {
      const gps = await getUserLocation();
      const address = await reverseGeocode(gps.lat, gps.lng).catch(() => undefined);
      const resolved = {
        ...gps,
        address,
        label: address ?? `GPS · ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`,
      };
      saveLocationLocally(resolved);
      return resolved;
    } catch {
      /* fall through */
    }
  }

  const fallback = defaultFallbackLocation();
  const address = await reverseGeocode(fallback.lat, fallback.lng).catch(() => undefined);
  return { ...fallback, address, label: address ?? fallback.label };
}

/** Call from a button click — requests fresh GPS and saves to profile + localStorage. */
export async function setCurrentLocation(): Promise<GeoLocation> {
  let gps = await getUserLocation({ highAccuracy: true, fresh: true });
  gps = await refineLocation(gps);
  const address = await reverseGeocode(gps.lat, gps.lng).catch(() => undefined);
  const resolved: GeoLocation = {
    ...gps,
    address: address ?? gps.address,
    label: address ?? gps.address ?? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`,
    source:
      gps.source === "approximate" || isApproximateLocation(gps)
        ? "approximate"
        : classifyGpsSource(gps.accuracy),
  };
  await persistUserLocation(resolved);
  return resolved;
}

export async function getUserLocationWithFallback(): Promise<GeoLocation> {
  return resolveDeliveryLocation();
}

export async function persistUserLocation(location: GeoLocation): Promise<void> {
  saveLocationLocally(location);

  try {
    await fetch("/api/user/location", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        address: location.address ?? location.label,
      }),
    });
  } catch {
    /* offline or not logged in — local cache still works */
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      { cache: "no-store" }
    );
    const data = (await res.json()) as { address?: string };
    return data.address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showEmergencyNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, tag: "medinova-emergency" });
  }
}
