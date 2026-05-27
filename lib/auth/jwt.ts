import crypto from "crypto";
import type { JwtPayload, UserRole } from "@/types/auth";

const SECRET =
  process.env.AUTH_SECRET ?? "medinova-dev-secret-change-in-production";

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function signToken(payload: {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  expiresInDays?: number;
}): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (payload.expiresInDays ?? 7) * 24 * 60 * 60;
  const body: JwtPayload = {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    iat: now,
    exp,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedBody = base64url(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedBody}`;
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const data = `${header}.${body}`;
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (expected !== signature) return null;

    const payload = JSON.parse(
      Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    ) as JwtPayload;

    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
