"use client";

import { motion } from "framer-motion";
import { Ambulance, MapPin, Navigation } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function AmbulanceTrackingCard() {
  return (
    <Card variant="elevated">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Ambulance className="h-4 w-4 text-danger" />
          Ambulance Tracking
        </CardTitle>
        <Badge variant="warning">En route</Badge>
      </CardHeader>

      <div className="relative h-40 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
        <motion.div
          className="absolute left-1/4 top-1/2 -translate-y-1/2"
          animate={{ x: [0, 80, 160], opacity: [1, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Ambulance className="h-8 w-8 text-danger" />
        </motion.div>
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 400 160" className="h-full w-full">
            <path
              d="M0 80 Q100 40 200 80 T400 80"
              stroke="#2563eb"
              strokeWidth="2"
              fill="none"
              strokeDasharray="8 4"
            />
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg glass px-2 py-1 text-xs">
          <MapPin className="h-3 w-3 text-primary" />
          ETA: 8 min
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg glass px-2 py-1 text-xs">
          <Navigation className="h-3 w-3 text-secondary" />
          2.4 km
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        Demo simulation — ambulance Unit A-7 responding to simulated emergency.
      </p>
    </Card>
  );
}
