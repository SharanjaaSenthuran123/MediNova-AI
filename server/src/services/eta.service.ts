import { haversineKm } from "./location.service.js";

/** Average delivery speed in km/h for ETA estimation. */
const DELIVERY_SPEED_KMH = 25;
const PACKING_MINUTES = 15;
const BASE_DISPATCH_MINUTES = 10;

export const MAX_DELIVERY_RADIUS_KM = 30;

export function estimateDeliveryMinutes(distanceKm: number): number {
  const travelMinutes = (distanceKm / DELIVERY_SPEED_KMH) * 60;
  return Math.ceil(PACKING_MINUTES + BASE_DISPATCH_MINUTES + travelMinutes);
}

export function estimateDeliveryAt(distanceKm: number, from = new Date()): Date {
  const minutes = estimateDeliveryMinutes(distanceKm);
  return new Date(from.getTime() + minutes * 60_000);
}

export function isWithinDeliveryRadius(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  maxKm = MAX_DELIVERY_RADIUS_KM
): boolean {
  return haversineKm(originLat, originLng, destLat, destLng) <= maxKm;
}

export function formatEtaMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
