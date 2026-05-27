import { NextResponse } from "next/server";
import { forwardAuthRequest } from "@/lib/api/auth-proxy";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { res, data } = await forwardAuthRequest("/forgot-password", {
      method: "POST",
      json: body,
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Cannot reach the MediNova API." }, { status: 503 });
  }
}
