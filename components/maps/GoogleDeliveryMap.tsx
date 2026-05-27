"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import type { GeoLocation } from "@/lib/geolocation";

const containerStyle = { width: "100%", height: "100%", minHeight: 240, borderRadius: "1rem" };

interface GoogleDeliveryMapProps {
  value: GeoLocation;
  onPinDrag: (lat: number, lng: number) => void;
}

export function GoogleDeliveryMap({ value, onPinDrag }: GoogleDeliveryMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded } = useJsApiLoader({
    id: "medinova-google-maps",
    googleMapsApiKey: apiKey,
  });

  if (!apiKey || !isLoaded) return null;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: value.lat, lng: value.lng }}
      zoom={16}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      <Marker
        position={{ lat: value.lat, lng: value.lng }}
        draggable
        onDragEnd={(e) => {
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (lat != null && lng != null) onPinDrag(lat, lng);
        }}
      />
    </GoogleMap>
  );
}

export function hasGoogleMapsKey() {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
}
