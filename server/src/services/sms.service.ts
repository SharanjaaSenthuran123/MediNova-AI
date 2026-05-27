import { env } from "../config/env.js";

export interface SmsSendResult {
  sent: boolean;
  preview?: boolean;
  detail: string;
  sid?: string;
}

export function isSmsConfigured(): boolean {
  return Boolean(
    env.twilio.accountSid && env.twilio.authToken && env.twilio.fromNumber
  );
}

/** Normalize to E.164-ish format for Twilio. */
export function normalizePhone(phone: string): string | null {
  if (!phone || phone.includes("@")) return null;
  const stripped = phone.replace(/\D/g, "");
  if (!stripped || stripped === "911") return null;
  if (stripped.length === 10) return `+1${stripped}`;
  if (stripped.length === 11 && stripped.startsWith("1")) return `+${stripped}`;
  if (phone.trim().startsWith("+")) return `+${stripped}`;
  if (stripped.length >= 10) return `+${stripped}`;
  return null;
}

export async function sendEmergencySms(
  to: string,
  body: string
): Promise<SmsSendResult> {
  const target = env.emergencySmsTo || to;
  const normalized = normalizePhone(target);

  if (!normalized) {
    return {
      sent: false,
      preview: false,
      detail: `Invalid or non-SMS number: ${target}`,
    };
  }

  if (!isSmsConfigured()) {
    console.log(`[sms:dev] To: ${normalized}\n${body}`);
    return {
      sent: false,
      preview: true,
      detail: "Twilio not configured — SMS logged to API console only",
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${env.twilio.accountSid}/Messages.json`;
    const auth = Buffer.from(
      `${env.twilio.accountSid}:${env.twilio.authToken}`
    ).toString("base64");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: normalized,
        From: env.twilio.fromNumber,
        Body: body,
      }),
    });

    const data = (await res.json()) as { sid?: string; message?: string };

    if (!res.ok) {
      return {
        sent: false,
        preview: false,
        detail: data.message ?? `Twilio error (${res.status})`,
      };
    }

    const overrideNote =
      env.emergencySmsTo && env.emergencySmsTo !== to
        ? ` (routed to EMERGENCY_SMS_TO for trial testing)`
        : "";

    return {
      sent: true,
      sid: data.sid,
      detail: `SMS sent to ${normalized}${overrideNote}`,
    };
  } catch (err) {
    return {
      sent: false,
      preview: false,
      detail: err instanceof Error ? err.message : "SMS send failed",
    };
  }
}
