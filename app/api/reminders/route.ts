import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

async function proxy(req: NextRequest) {
  const url = `${API_URL}/api/reminders${req.nextUrl.search}`;

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
  try {
    return await proxy(req);
  } catch {
    return NextResponse.json({ error: "Reminders API unavailable", reminders: [], suggestions: [] }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await proxy(req);
  } catch {
    return NextResponse.json({ error: "Reminders API unavailable" }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    return await proxy(req);
  } catch {
    return NextResponse.json({ error: "Reminders API unavailable" }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return await proxy(req);
  } catch {
    return NextResponse.json({ error: "Reminders API unavailable" }, { status: 503 });
  }
}
