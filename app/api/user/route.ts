import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentUser, handleUserMutation } from "@/lib/api/user-api";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const user = await fetchCurrentUser(cookieHeader);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Profile API unavailable", user: null },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieHeader = req.headers.get("cookie") ?? "";
    const result = await handleUserMutation("POST", body, cookieHeader);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieHeader = req.headers.get("cookie") ?? "";
    const result = await handleUserMutation("PATCH", body, cookieHeader);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const result = await handleUserMutation("DELETE", null, cookieHeader);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
