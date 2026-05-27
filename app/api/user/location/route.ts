import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/api/user/location`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Cannot reach API" }, { status: 503 });
  }
}
