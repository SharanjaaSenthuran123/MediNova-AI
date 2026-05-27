"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, MapPin, Minus, Plus } from "lucide-react";
import { reverseGeocode, persistUserLocation, setCurrentLocation, LocationError, getLocationHelpText, type GeoLocation } from "@/lib/geolocation";
import {
  latLngToPoint,
  pointToLatLng,
  tileUrl,
  visibleTiles,
} from "@/lib/map-utils";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { GoogleDeliveryMap, hasGoogleMapsKey } from "@/components/maps/GoogleDeliveryMap";

interface DeliveryLocationPickerProps {
  value: GeoLocation;
  onChange: (location: GeoLocation) => void;
  className?: string;
}

type DragMode = "pin" | "pan" | null;

export function DeliveryLocationPicker({
  value,
  onChange,
  className,
}: DeliveryLocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState({ lat: value.lat, lng: value.lng });
  const [zoom, setZoom] = useState(15);
  const [size, setSize] = useState({ width: 640, height: 280 });
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ lat: 0, lng: 0 });
  const [locating, setLocating] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    setCenter({ lat: value.lat, lng: value.lng });
  }, [value.lat, value.lng]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({
        width: Math.max(entry.contentRect.width, 280),
        height: Math.max(entry.contentRect.height, 240),
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const updateAddress = useCallback(
    async (lat: number, lng: number) => {
      setAddressLoading(true);
      try {
        const address = await reverseGeocode(lat, lng);
        onChange({
          lat,
          lng,
          address,
          label: address,
          source: "manual",
        });
        void persistUserLocation({
          lat,
          lng,
          address,
          label: address,
          source: "manual",
        });
      } finally {
        setAddressLoading(false);
      }
    },
    [onChange, value.source]
  );

  const setPinAt = useCallback(
    (x: number, y: number) => {
      const next = pointToLatLng(x, y, center.lat, center.lng, zoom, size.width, size.height);
      onChange({
        ...value,
        lat: next.lat,
        lng: next.lng,
      });
      void updateAddress(next.lat, next.lng);
    },
    [center.lat, center.lng, onChange, size.height, size.width, updateAddress, value, zoom]
  );

  const pin = latLngToPoint(
    value.lat,
    value.lng,
    center.lat,
    center.lng,
    zoom,
    size.width,
    size.height
  );

  const tiles = visibleTiles(center.lat, center.lng, zoom, size.width, size.height);

  const onPointerDownPin = (e: React.PointerEvent) => {
    e.stopPropagation();
    setDragMode("pin");
    setDragStart({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerDownMap = (e: React.PointerEvent) => {
    if (dragMode) return;
    setDragMode("pan");
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ lat: center.lat, lng: center.lng });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragMode === "pin") {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const next = pointToLatLng(x, y, center.lat, center.lng, zoom, size.width, size.height);
      onChange({ ...value, lat: next.lat, lng: next.lng });
      return;
    }

    if (dragMode === "pan") {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const nextCenter = pointToLatLng(
        size.width / 2 - dx,
        size.height / 2 - dy,
        panStart.lat,
        panStart.lng,
        zoom,
        size.width,
        size.height
      );
      setCenter(nextCenter);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragMode === "pin") {
      void updateAddress(value.lat, value.lng);
    }
    setDragMode(null);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onMapClick = (e: React.MouseEvent) => {
    if (dragMode) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPinAt(e.clientX - rect.left, e.clientY - rect.top);
  };

  const locateMe = async () => {
    setLocating(true);
    try {
      const resolved = await setCurrentLocation();
      setCenter({ lat: resolved.lat, lng: resolved.lng });
      onChange(resolved);
    } catch (err) {
      const code = err instanceof LocationError ? err.code : undefined;
      onChange({
        ...value,
        label: getLocationHelpText(code),
      });
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Delivery location</p>
          <p className="text-xs text-muted">
            Drag the pin or tap the map · pan by dragging the background
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(z + 1, 18))}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(z - 1, 12))}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={locateMe} disabled={locating}>
            <Crosshair className="h-4 w-4" />
            {locating ? "Locating…" : "My location"}
          </Button>
        </div>
      </div>

      {hasGoogleMapsKey() ? (
        <div className="h-[280px] overflow-hidden rounded-xl border border-border/60">
          <GoogleDeliveryMap
            value={value}
            onPinDrag={(lat, lng) => {
              onChange({ ...value, lat, lng, source: "manual" });
              void updateAddress(lat, lng);
            }}
          />
        </div>
      ) : (
      <div
        ref={containerRef}
        className="relative h-[280px] w-full cursor-grab overflow-hidden rounded-xl border border-border/60 bg-slate-900/40 active:cursor-grabbing"
        onPointerDown={onPointerDownMap}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={onMapClick}
        role="application"
        aria-label="Delivery location map. Drag pin or tap to set location."
      >
        {tiles.map((tile) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${zoom}-${tile.x}-${tile.y}`}
            src={tileUrl(tile.x, tile.y, zoom)}
            alt=""
            draggable={false}
            className="pointer-events-none absolute h-64 w-64 select-none"
            style={{ left: tile.left, top: tile.top, width: 256, height: 256 }}
          />
        ))}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />

        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-full touch-none pointer-events-auto cursor-grab active:cursor-grabbing"
          style={{ left: pin.x, top: pin.y }}
          onPointerDown={onPointerDownPin}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex flex-col items-center">
            <span className="absolute -inset-3 rounded-full bg-primary/20 animate-pulse" />
            <MapPin
              className="relative h-10 w-10 text-primary drop-shadow-lg"
              fill="currentColor"
            />
          </div>
        </div>
      </div>
      )}

      <div className="rounded-lg bg-white/40 px-3 py-2 text-sm dark:bg-white/5">
        <p className="font-medium">
          {addressLoading ? "Looking up address…" : value.address ?? value.label ?? "Set delivery point"}
        </p>
        <p className="text-xs text-muted">
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          {value.source === "gps"
            ? " · GPS"
            : value.source === "saved"
              ? " · saved location"
              : value.source === "fallback"
                ? " · tap My location for GPS"
                : ""}
        </p>
      </div>
    </div>
  );
}
