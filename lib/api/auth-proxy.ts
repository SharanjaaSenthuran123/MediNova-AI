const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function forwardAuthRequest(
  path: string,
  init: RequestInit & { json?: unknown; cookieHeader?: string }
) {
  const headers = new Headers(init.headers);
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (init.cookieHeader) {
    headers.set("Cookie", init.cookieHeader);
  }

  const res = await fetch(`${API_URL}/api/auth${path}`, {
    ...init,
    headers,
    body:
      init.json !== undefined ? JSON.stringify(init.json) : (init.body as BodyInit | undefined),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export function buildCookieHeader(
  entries: Array<{ name: string; value: string | undefined }>
): string | undefined {
  const parts = entries
    .filter((entry): entry is { name: string; value: string } => Boolean(entry.value))
    .map((entry) => `${entry.name}=${entry.value}`);
  return parts.length > 0 ? parts.join("; ") : undefined;
}
