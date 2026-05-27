import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

async function proxyPatients(req: NextRequest, suffix = "") {
  const url = `${API_URL}/api/patients${suffix}${req.nextUrl.search}`;

  const res = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": req.headers.get("content-type") ?? "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest) {
  return proxyPatients(req);
}

export async function POST(req: NextRequest) {
  return proxyPatients(req);
}
