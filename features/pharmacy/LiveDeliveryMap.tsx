"use client";

import { useEffect, useState } from "react";
import { Truck, ExternalLink } from "lucide-react";
import { getSocket } from "@/components/providers/SocketProvider";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface LiveDeliveryMapProps {
  orderId: string;
  userLat: number;
  userLng: number;
  agentLocation?: { lat: number; lng: number } | null;
  pharmacyLat?: number;
  pharmacyLng?: number;
}

export function LiveDeliveryMap({
  orderId,
  userLat,
  userLng,
  agentLocation: initialAgent,
}: LiveDeliveryMapProps) {
  const [agent, setAgent] = useState(initialAgent);

  useEffect(() => {
    setAgent(initialAgent);
  }, [initialAgent]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onLocation = (payload: { orderId: string; lat: number; lng: number }) => {
      if (payload.orderId === orderId) {
        setAgent({ lat: payload.lat, lng: payload.lng });
      }
    };

    socket.on("delivery:location", onLocation);
    return () => {
      socket.off("delivery:location", onLocation);
    };
  }, [orderId]);

  const mapLat = agent?.lat ?? userLat;
  const mapLng = agent?.lng ?? userLng;
  const delta = 0.02;
  const bbox = `${mapLng - delta},${mapLat - delta},${mapLng + delta},${mapLat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mapLat}%2C${mapLng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${userLat},${userLng}${
    agent ? `&origin=${agent.lat},${agent.lng}` : ""
  }`;

  return (
    <Card className="glass overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-sm">
        <span className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          Live delivery tracking
        </span>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <iframe
        title="Delivery map"
        src={embedUrl}
        className="h-48 w-full border-0"
        loading="lazy"
      />
      {agent && (
        <p className="px-3 py-2 text-xs text-muted">
          Courier location updating in realtime · ETA based on route
        </p>
      )}
    </Card>
  );
}
