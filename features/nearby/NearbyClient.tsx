"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Cross,
  Crosshair,
  Droplets,
  FlaskConical,
  MapPin,
  Navigation,
  Pill,
  RefreshCw,
  Search,
  Siren,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { DeliveryLocationPicker } from "@/features/pharmacy/DeliveryLocationPicker";
import { SavedAddressesPanel } from "@/features/pharmacy/SavedAddressesPanel";
import {
  LocationError,
  formatAccuracyMeters,
  getLocationHelpText,
  getLocationQualityWarning,
  getGeolocationPermission,
  isApproximateLocation,
  persistUserLocation,
  resolveDeliveryLocation,
  setCurrentLocation,
  type GeoLocation,
} from "@/lib/geolocation";

type FacilityType =
  | "hospital"
  | "pharmacy"
  | "clinic"
  | "lab"
  | "blood_bank"
  | "ambulance";

interface NearbyPlace {
  id: string;
  name: string;
  type: FacilityType;
  distanceKm: number;
  address: string;
  lat: number;
  lng: number;
}

const TYPE_META: Record<
  FacilityType,
  { label: string; icon: typeof Cross; color: string }
> = {
  hospital: {
    label: "Hospital",
    icon: Cross,
    color: "text-danger border-danger/30 bg-danger/10",
  },
  pharmacy: {
    label: "Pharmacy",
    icon: Pill,
    color: "text-accent border-accent/30 bg-accent/10",
  },
  clinic: {
    label: "Clinic",
    icon: Stethoscope,
    color: "text-primary border-primary/30 bg-primary/10",
  },
  lab: {
    label: "Lab",
    icon: FlaskConical,
    color: "text-secondary border-secondary/30 bg-secondary/10",
  },
  blood_bank: {
    label: "Blood bank",
    icon: Droplets,
    color: "text-danger border-danger/30 bg-danger/10",
  },
  ambulance: {
    label: "Ambulance",
    icon: Siren,
    color: "text-warning border-warning/30 bg-warning/10",
  },
};

function locationSourceLabel(source?: GeoLocation["source"]): string {
  switch (source) {
    case "gps":
      return "GPS";
    case "approximate":
      return "Approximate (network)";
    case "manual":
      return "Pin on map";
    case "saved":
      return "Saved location";
    case "fallback":
      return "Default area";
    default:
      return "Location";
  }
}

async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radius = 10000
): Promise<{ places: NearbyPlace[]; error?: string }> {
  const res = await fetch(
    `/api/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${radius}`,
    { cache: "no-store", signal: AbortSignal.timeout(45000) }
  );
  const data = (await res.json()) as { places?: NearbyPlace[]; error?: string };
  const places = data.places ?? [];
  if (places.length > 0) return { places };
  if (!res.ok) {
    return { places: [], error: data.error ?? "Could not load nearby facilities" };
  }
  return { places: [], error: data.error };
}

async function fetchNearbyWithRetry(
  lat: number,
  lng: number
): Promise<{ places: NearbyPlace[]; error?: string }> {
  const first = await fetchNearbyPlaces(lat, lng, 10000);
  if (first.places.length > 0) return first;
  const wider = await fetchNearbyPlaces(lat, lng, 15000);
  if (wider.places.length > 0) return wider;
  return { places: [], error: wider.error ?? first.error };
}

export function NearbyClient() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationHint, setLocationHint] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | FacilityType>("all");

  const loadPlacesFor = useCallback(async (geo: GeoLocation) => {
    const { places: results, error: fetchError } = await fetchNearbyWithRetry(
      geo.lat,
      geo.lng
    );
    setPlaces(results);
    if (fetchError && results.length === 0) {
      throw new Error(fetchError);
    }
    return results;
  }, []);

  const loadNearby = useCallback(async (options?: { preferGps?: boolean; quiet?: boolean }) => {
    setLoading(true);
    setLocating(true);
    setError(null);
    setLocationHint(null);

    let geo: GeoLocation;
    if (options?.preferGps) {
      try {
        geo = await setCurrentLocation();
        if (!options?.quiet) {
          if (isApproximateLocation(geo)) {
            toast.warning("Approximate location only", {
              description:
                getLocationQualityWarning(geo) ??
                "Drag the pin on the map to your exact address.",
            });
          } else {
            toast.success("Current location set", {
              description:
                geo.address?.slice(0, 80) ?? `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}`,
            });
          }
        }
      } catch (err) {
        geo = await resolveDeliveryLocation();
        if (!options?.quiet) {
          const code = err instanceof LocationError ? err.code : undefined;
          toast.error("Could not get GPS", {
            description: getLocationHelpText(code),
          });
        }
      }
    } else {
      geo = await resolveDeliveryLocation();
    }

    setLocation(geo);
    setLocating(false);

    const needsGps =
      geo.source === "fallback" || geo.source === "default";
    const qualityWarning = getLocationQualityWarning(geo);

    if (qualityWarning) {
      setLocationHint(qualityWarning);
    } else if (needsGps && !options?.quiet) {
      setLocationHint(getLocationHelpText());
    }

    try {
      const results = await loadPlacesFor(geo);
      if (results.length === 0 && !needsGps && !qualityWarning) {
        setError(
          "No hospitals, clinics, pharmacies, or labs found within 15 km. Drag the pin to your area or tap Set current location."
        );
      } else if (results.length > 0) {
        setError(null);
        if (geo.source === "manual" || geo.source === "saved") {
          setLocationHint(null);
        }
      }
    } catch (err) {
      setPlaces([]);
      setError(
        err instanceof Error
          ? err.message
          : "OpenStreetMap data unavailable — try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }, [loadPlacesFor]);

  const handlePinChange = useCallback(
    async (geo: GeoLocation) => {
      const manual = { ...geo, source: "manual" as const };
      setLocation(manual);
      setError(null);
      setLocationHint(null);
      setLoading(true);
      await persistUserLocation(manual);
      try {
        await loadPlacesFor(manual);
        toast.success("Location updated on map");
      } catch (err) {
        setPlaces([]);
        setError(err instanceof Error ? err.message : "Could not refresh nearby facilities.");
      } finally {
        setLoading(false);
      }
    },
    [loadPlacesFor]
  );

  useEffect(() => {
    void (async () => {
      const permission = await getGeolocationPermission();
      await loadNearby({
        preferGps: permission === "granted",
        quiet: permission !== "granted",
      });
    })();
  }, [loadNearby]);

  const filtered = places.filter((p) => {
    const typeMatch = filter === "all" || p.type === filter;
    const q = search.trim().toLowerCase();
    const searchMatch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      TYPE_META[p.type].label.toLowerCase().includes(q);
    return typeMatch && searchMatch;
  });

  const countByType = places.reduce(
    (acc, p) => {
      acc[p.type] = (acc[p.type] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<FacilityType, number>>
  );

  const directionsUrl = (place: NearbyPlace) =>
    location
      ? `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${place.lat},${place.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

  const mapUrl =
    location &&
    `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.02}%2C${location.lat - 0.015}%2C${location.lng + 0.02}%2C${location.lat + 0.015}&layer=mapnik&marker=${location.lat}%2C${location.lng}`;

  const usingFallback =
    location?.source === "fallback" || location?.source === "default";

  return (
    <div className="space-y-6">
      <Card variant="glass" className="border-primary/15">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-4 w-4 text-primary" />
              Your location
            </CardTitle>
            <CardDescription className="mt-1">
              {locating ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Getting your current location…
                </span>
              ) : location ? (
                <>
                  {locationSourceLabel(location.source)}
                  {location.address || location.label
                    ? ` · ${location.address ?? location.label}`
                    : ` · ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                  {formatAccuracyMeters(location.accuracy)
                    ? ` · ${formatAccuracyMeters(location.accuracy)}`
                    : ""}
                </>
              ) : (
                "Location not detected"
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || locating}
            onClick={() => void loadNearby({ preferGps: true })}
          >
            <Crosshair className="h-4 w-4" />
            Set current location
          </Button>
        </CardHeader>
        {usingFallback && (
          <Badge variant="warning" className="mb-3">
            Tap Set current location and allow browser access
          </Badge>
        )}
        {location && isApproximateLocation(location) && (
          <Badge variant="warning" className="mb-3">
            Approximate area — drag the pin on the map to refine
          </Badge>
        )}
      </Card>

      {location && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card variant="glass" className="border-primary/15 p-4">
            <DeliveryLocationPicker value={location} onChange={handlePinChange} />
          </Card>
          <SavedAddressesPanel
            currentLocation={location}
            onSelect={handlePinChange}
          />
        </div>
      )}

      {mapUrl && (
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <iframe
            title="Nearby healthcare map"
            src={mapUrl}
            className="h-56 w-full border-0 sm:h-72"
            loading="lazy"
          />
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search hospitals, pharmacies, clinics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              "all",
              "hospital",
              "clinic",
              "pharmacy",
              "lab",
              "blood_bank",
              "ambulance",
            ] as const
          ).map((t) => {
            const count =
              t === "all" ? places.length : (countByType[t as FacilityType] ?? 0);
            return (
              <Button
                key={t}
                size="sm"
                variant={filter === t ? "primary" : "outline"}
                onClick={() => setFilter(t)}
              >
                {t === "all" ? "All" : TYPE_META[t as FacilityType].label}
                {count > 0 ? ` (${count})` : ""}
              </Button>
            );
          })}
        </div>
      </div>

      {places.length > 0 && !loading && (
        <p className="text-sm text-muted">
          Found {places.length} facilities near you
          {countByType.hospital ? ` · ${countByType.hospital} hospitals` : ""}
          {countByType.clinic ? ` · ${countByType.clinic} clinics` : ""}
          {countByType.pharmacy ? ` · ${countByType.pharmacy} pharmacies` : ""}
          {countByType.lab ? ` · ${countByType.lab} labs` : ""}
        </p>
      )}

      {locationHint && (
        <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {locationHint}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No facilities found"
          description="Try Set current location, a different filter, or refresh the search."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((place, index) => {
            const meta = TYPE_META[place.type];
            const Icon = meta.icon;
            return (
              <motion.li
                key={place.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" interactive className="h-full">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${meta.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <Badge variant="outline">{meta.label}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold">{place.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <Building2 className="h-3 w-3" />
                    {place.address}
                  </p>
                  <p className="mt-2 text-sm font-medium text-primary">
                    {place.distanceKm < 1
                      ? `${Math.round(place.distanceKm * 1000)} m away`
                      : `${place.distanceKm.toFixed(1)} km away`}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href={directionsUrl(place)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-xs font-medium text-primary hover:underline"
                    >
                      Get directions →
                    </a>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=16/${place.lat}/${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-xs font-medium text-muted hover:underline"
                    >
                      View on map
                    </a>
                  </div>
                </Card>
              </motion.li>
            );
          })}
        </ul>
      )}

      <Button variant="outline" size="sm" onClick={() => void loadNearby({ preferGps: true })}>
        <RefreshCw className="h-4 w-4" />
        Refresh nearby search
      </Button>
    </div>
  );
}
