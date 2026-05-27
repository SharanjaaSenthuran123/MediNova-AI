import type { OtpRecord } from "@/types/auth";

declare global {
  // eslint-disable-next-line no-var
  var __medinovaOtp: Map<string, OtpRecord> | undefined;
}

function getOtpMap(): Map<string, OtpRecord> {
  if (!global.__medinovaOtp) {
    global.__medinovaOtp = new Map();
  }
  return global.__medinovaOtp;
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtp(
  email: string,
  purpose: OtpRecord["purpose"]
): string {
  const code = generateOtp();
  const map = getOtpMap();
  map.set(email.toLowerCase(), {
    email: email.toLowerCase(),
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    purpose,
  });
  return code;
}

export function verifyOtp(
  email: string,
  code: string,
  purpose: OtpRecord["purpose"],
  consume = true
): boolean {
  const map = getOtpMap();
  const record = map.get(email.toLowerCase());
  if (!record) return false;
  if (record.purpose !== purpose) return false;
  if (record.expiresAt < Date.now()) {
    map.delete(email.toLowerCase());
    return false;
  }
  if (record.code !== code) return false;
  if (consume) map.delete(email.toLowerCase());
  return true;
}
