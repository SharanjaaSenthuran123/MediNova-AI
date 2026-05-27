import { NextResponse } from "next/server";
import { z } from "zod";
import { isOpenAIConfigured } from "@/lib/env";
import { getDemoMedicineInsight } from "@/lib/medicine-fallback";
import { enrichMedicineWithOpenAI } from "@/lib/openai-medicine";
import type { Medicine } from "@/types/medicine";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const schema = z.object({
  barcode: z.string().min(1).max(50),
});

async function lookupFromApi(barcode: string, cookieHeader?: string) {
  const res = await fetch(`${API_URL}/api/medicine-lookup?barcode=${encodeURIComponent(barcode)}`, {
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
  });
  return res;
}

async function lookup(barcode: string, cookieHeader?: string) {
  const apiRes = await lookupFromApi(barcode, cookieHeader);

  if (!apiRes.ok) {
    const err = (await apiRes.json().catch(() => ({}))) as { error?: string };
    return NextResponse.json(
      { error: err.error ?? "Medicine not found", barcode },
      { status: apiRes.status }
    );
  }

  const data = (await apiRes.json()) as {
    medicine: {
      barcode: string;
      name: string;
      genericName?: string;
      dosage?: string;
      manufacturer?: string;
      expiry?: string;
      warnings?: string[];
      description?: string;
    };
  };

  const medicine: Medicine = {
    barcode: data.medicine.barcode,
    name: data.medicine.name,
    genericName: data.medicine.genericName ?? data.medicine.name,
    dosage: data.medicine.dosage ?? "As directed",
    manufacturer: data.medicine.manufacturer ?? "Unknown",
    expiry: data.medicine.expiry ?? "Verify on package",
    warnings: data.medicine.warnings ?? [],
    description: data.medicine.description ?? "",
  };

  let aiInsight = getDemoMedicineInsight(medicine);
  let demoMode = true;
  let message: string | undefined;

  if (isOpenAIConfigured()) {
    try {
      aiInsight = await enrichMedicineWithOpenAI(medicine);
      demoMode = false;
    } catch (err) {
      console.error("OpenAI medicine enrichment failed:", err);
      message = "Live AI insights temporarily unavailable — showing guidance from database record.";
    }
  } else {
    message = "Add OPENAI_API_KEY for live AI enrichment. Medicine data is from MongoDB.";
  }

  return NextResponse.json({
    medicine,
    barcode,
    aiInsight,
    demoMode,
    message,
    source: "mongodb",
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = schema.safeParse({ barcode: searchParams.get("barcode") ?? "" });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid barcode" }, { status: 400 });
  }

  return lookup(parsed.data.barcode, request.headers.get("cookie") ?? undefined);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid barcode" }, { status: 400 });
    }

    return lookup(parsed.data.barcode, request.headers.get("cookie") ?? undefined);
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
