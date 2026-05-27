import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserRecord } from "@/lib/db/store";
import type { UserRecord } from "@/types/user";

type RequireUserSuccess = {
  ok: true;
  userId: string;
  record: UserRecord;
};

type RequireUserFailure = {
  ok: false;
  response: NextResponse;
};

export type RequireUserResult = RequireUserSuccess | RequireUserFailure;

/** Shared session + profile check for authenticated API routes. */
export async function requireUser(options?: {
  unauthorizedMessage?: string;
}): Promise<RequireUserResult> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            options?.unauthorizedMessage ??
            "Create a profile to use this feature.",
        },
        { status: 401 }
      ),
    };
  }

  const record = await getUserRecord(userId);

  if (!record) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Profile not found" }, { status: 404 }),
    };
  }

  return { ok: true, userId, record };
}
