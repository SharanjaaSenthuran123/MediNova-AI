import { NextRequest, NextResponse } from "next/server";
import { handleContactsRequest } from "@/lib/api/user-api";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const result = await handleContactsRequest("GET", null, cookieHeader);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ contacts: result.contacts });
  } catch {
    return NextResponse.json({ error: "Contacts API unavailable" }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieHeader = req.headers.get("cookie") ?? "";
    const result = await handleContactsRequest("PUT", body, cookieHeader);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ contacts: result.contacts });
  } catch {
    return NextResponse.json({ error: "Failed to save contacts" }, { status: 500 });
  }
}
