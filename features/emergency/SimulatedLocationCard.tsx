import { ExternalLink, MapPin } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { SimulatedLocation } from "@/types/emergency";

interface SimulatedLocationCardProps {
  location: SimulatedLocation;
  compact?: boolean;
}

export function SimulatedLocationCard({
  location,
  compact,
}: SimulatedLocationCardProps) {
  const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 shrink-0 text-danger" />
        <span className="text-muted">{location.address}</span>
        <Badge variant="outline" className="text-xs">
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="border-danger/30 bg-danger/5">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-danger" />
            Simulated location
          </CardTitle>
          <Badge variant="secondary">Demo GPS</Badge>
        </div>
        <CardDescription>{location.address}</CardDescription>
      </CardHeader>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <code className="rounded bg-background/80 px-2 py-1">
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </code>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          View on map
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </Card>
  );
}
