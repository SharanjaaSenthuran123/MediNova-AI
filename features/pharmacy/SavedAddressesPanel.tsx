"use client";

import { useCallback, useEffect, useState } from "react";
import { Home, Briefcase, MapPin, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, apiPost, apiDelete } from "@/lib/api/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { GeoLocation } from "@/lib/geolocation";

export interface SavedAddress {
  id: string;
  label: "home" | "work" | "other";
  customLabel?: string;
  address: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

interface SavedAddressesPanelProps {
  currentLocation?: GeoLocation | null;
  onSelect: (location: GeoLocation) => void;
}

const labelIcon = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

export function SavedAddressesPanel({ currentLocation, onSelect }: SavedAddressesPanelProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [maxRadius, setMaxRadius] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ addresses: SavedAddress[]; maxDeliveryRadiusKm: number }>(
        "/api/addresses"
      );
      setAddresses(data.addresses);
      setMaxRadius(data.maxDeliveryRadiusKm);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveCurrent = async () => {
    if (!currentLocation?.address) {
      toast.error("Set a delivery location first");
      return;
    }
    try {
      await apiPost("/api/addresses", {
        label: "home",
        address: currentLocation.address,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        isDefault: addresses.length === 0,
      });
      toast.success("Address saved");
      void load();
    } catch {
      toast.error("Sign in to save addresses");
    }
  };

  const remove = async (id: string) => {
    await apiDelete(`/api/addresses/${id}`);
    void load();
  };

  return (
    <Card className="glass p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold">Saved addresses</h3>
        <Badge variant="outline">Delivery within {maxRadius} km</Badge>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-muted">No saved addresses yet.</p>
      ) : (
        <ul className="space-y-2">
          {addresses.map((addr) => {
            const Icon = labelIcon[addr.label];
            return (
              <li
                key={addr.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-white/10 p-2.5"
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-start gap-2 text-left"
                  onClick={() =>
                    onSelect({
                      lat: addr.lat,
                      lng: addr.lng,
                      address: addr.address,
                      label: addr.customLabel ?? addr.label,
                    })
                  }
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 font-medium capitalize">
                      {addr.customLabel ?? addr.label}
                      {addr.isDefault && <Star className="h-3 w-3 text-amber-500" />}
                    </span>
                    <span className="block truncate text-xs text-muted">{addr.address}</span>
                  </span>
                </button>
                <Button variant="ghost" size="sm" onClick={() => void remove(addr.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => void saveCurrent()}>
        <Plus className="mr-1 h-4 w-4" />
        Save current location
      </Button>
    </Card>
  );
}
