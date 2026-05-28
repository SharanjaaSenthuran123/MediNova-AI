const LOCAL_API_URL = "http://127.0.0.1:4000";

export function isRemoteApiConfigured(): boolean {
  const raw = process.env.API_URL?.trim();
  if (!raw) return false;
  return !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(raw);
}

export function getApiUrl(): string {
  const raw = process.env.API_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "";
  }
  return LOCAL_API_URL;
}

/** Server-side fetch to Express with timeout and localhost → 127.0.0.1 fallback (Windows). */
export async function fetchApi(
  path: string,
  init: RequestInit = {},
  timeoutMs = 15000
): Promise<Response> {
  const base = getApiUrl();
  if (!base) {
    throw new Error("API_URL is not configured");
  }

  const origins = base.includes("localhost")
    ? [base, base.replace("localhost", "127.0.0.1")]
    : [base];

  let lastError: unknown;

  for (const origin of origins) {
    try {
      return await fetch(`${origin}${path}`, {
        ...init,
        cache: "no-store",
        signal: init.signal ?? AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("Cannot reach the MediNova API");
}

export function isProductionHost(): boolean {
  return Boolean(process.env.VERCEL || process.env.NODE_ENV === "production");
}
