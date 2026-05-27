export type ExpiryStatus = "valid" | "expiring_soon" | "expired";

const EXPIRING_SOON_DAYS = 60;

export function getExpiryStatus(expiry: string, now = new Date()): ExpiryStatus {
  const expiryDate = new Date(expiry);
  if (Number.isNaN(expiryDate.getTime())) return "valid";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiryDay = new Date(
    expiryDate.getFullYear(),
    expiryDate.getMonth(),
    expiryDate.getDate()
  );

  if (expiryDay < today) return "expired";

  const msUntilExpiry = expiryDay.getTime() - today.getTime();
  const daysUntilExpiry = msUntilExpiry / (1000 * 60 * 60 * 24);

  if (daysUntilExpiry <= EXPIRING_SOON_DAYS) return "expiring_soon";
  return "valid";
}

export function formatExpiryDate(expiry: string): string {
  const date = new Date(expiry);
  if (Number.isNaN(date.getTime())) return expiry;
  // Fixed locale avoids SSR/client hydration mismatches from toLocaleDateString(undefined).
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const expiryStatusLabel: Record<ExpiryStatus, string> = {
  valid: "Valid",
  expiring_soon: "Expiring soon",
  expired: "Expired",
};

export const expiryStatusVariant: Record<
  ExpiryStatus,
  "success" | "warning" | "danger"
> = {
  valid: "success",
  expiring_soon: "warning",
  expired: "danger",
};
