const DEFAULT_API_URL = "http://127.0.0.1:4000";

export function getApiUrl(): string {
  const raw = process.env.API_URL?.trim();
  return (raw || DEFAULT_API_URL).replace(/\/$/, "");
}

/** Server-side fetch to Express with timeout and localhost → 127.0.0.1 fallback (Windows). */
export async function fetchApi(
  path: string,
  init: RequestInit = {},
  timeoutMs = 15000
): Promise<Response> {
  const base = getApiUrl();
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
