"use client";

import { Ambulance, ExternalLink, MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { SimulatedLocation } from "@/types/emergency";
import { cn } from "@/lib/utils";

interface SimulatedMapProps {
  location: SimulatedLocation;
  showRoute?: boolean;
  acquiring?: boolean;
  className?: string;
}

export function SimulatedMap({
  location,
  showRoute = false,
  acquiring = false,
  className,
}: SimulatedMapProps) {
  const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-danger/30 bg-slate-950 shadow-lg",
        className
      )}
    >
      <div className="absolute inset-0 map-grid opacity-60" />

      {/* Street blocks */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[18%] top-0 h-full w-px bg-slate-500/30" />
        <div className="absolute left-[52%] top-0 h-full w-px bg-slate-500/30" />
        <div className="absolute left-[78%] top-0 h-full w-px bg-slate-500/30" />
        <div className="absolute left-0 top-[28%] h-px w-full bg-slate-500/30" />
        <div className="absolute left-0 top-[62%] h-px w-full bg-slate-500/30" />
        <div className="absolute left-[12%] top-[12%] h-[22%] w-[28%] rounded-sm bg-slate-800/80" />
        <div className="absolute left-[58%] top-[18%] h-[18%] w-[22%] rounded-sm bg-slate-800/80" />
        <div className="absolute left-[22%] top-[68%] h-[20%] w-[35%] rounded-sm bg-slate-800/80" />
        <div className="absolute left-[68%] top-[58%] h-[24%] w-[20%] rounded-sm bg-slate-800/80" />
      </div>

      {/* Radar sweep */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "map-radar-sweep h-[140%] w-[140%] rounded-full opacity-30",
            "bg-[conic-gradient(from_0deg,transparent_0deg,rgb(239_68_68_/_0.35)_40deg,transparent_80deg)]"
          )}
        />
      </div>

      {/* Ambulance route */}
      {showRoute && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 400 220"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 340 40 Q 280 80 220 110 T 120 150"
            fill="none"
            stroke="rgb(34 197 94 / 0.85)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className="map-route-draw"
          />
          <circle cx="340" cy="40" r="6" fill="rgb(34 197 94 / 0.9)" />
        </svg>
      )}

      {/* Location pin */}
      <div className="absolute left-1/2 top-[52%] z-10 -translate-x-1/2 map-pin-pulse">
        <div className="relative flex flex-col items-center">
          <span className="absolute -inset-4 rounded-full bg-danger/20" />
          <span className="absolute -inset-2 rounded-full bg-danger/30 animate-ping" />
          <MapPin className="relative h-10 w-10 text-danger drop-shadow-lg" fill="currentColor" />
        </div>
      </div>

      {showRoute && (
        <div className="absolute right-3 top-14 z-10 flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/15 px-2 py-1 text-[10px] font-medium text-success">
          <Ambulance className="h-3 w-3" />
          Unit en route (simulated)
        </div>
      )}

      {/* HUD overlay */}
      <div className="relative z-20 flex flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge
            variant="danger"
            className={cn("gap-1.5", acquiring && "animate-pulse")}
          >
            <Navigation className="h-3 w-3" />
            {acquiring ? "Acquiring GPS…" : "GPS locked"}
          </Badge>
          <Badge variant="outline" className="border-slate-600 bg-slate-900/80 text-slate-200">
            Demo map
          </Badge>
        </div>
      </div>

      <div className="relative z-20 mt-auto border-t border-slate-700/80 bg-slate-950/90 p-3">
        <p className="truncate text-xs font-medium text-slate-100">{location.address}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <code className="text-[10px] text-slate-400">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </code>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
          >
            Open maps
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="aspect-[16/10]" aria-hidden />
    </div>
  );
}
