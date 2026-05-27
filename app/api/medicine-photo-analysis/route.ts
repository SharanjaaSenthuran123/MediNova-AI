import { NextResponse } from "next/server";
import { z } from "zod";
import { findMedicineByBarcode } from "@/data/medicines";
import { isOpenAIConfigured } from "@/lib/env";
import { getDemoMedicinePhotoAnalysis } from "@/lib/medicine-photo-fallback";
import { analyzeMedicinePhotoWithOpenAI } from "@/lib/openai-medicine-vision";

const schema = z.object({
  imageBase64: z.string().min(100),
  mimeType: z
    .enum(["image/jpeg", "image/png", "image/webp", "image/jpg"])
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid image payload" }, { status: 400 });
    }

    let analysis = getDemoMedicinePhotoAnalysis();
    let demoMode = true;
    let message: string | undefined;
    let databaseMatch = null as ReturnType<typeof findMedicineByBarcode> | null;

    if (isOpenAIConfigured()) {
      try {
        analysis = await analyzeMedicinePhotoWithOpenAI(parsed.data.imageBase64);
        demoMode = false;
      } catch (err) {
        console.error("OpenAI medicine photo analysis failed:", err);
        message =
          "Live vision AI temporarily unavailable — showing demo photo analysis.";
      }
    } else {
      message =
        "OpenAI API key not configured — showing demo photo analysis. Add OPENAI_API_KEY to .env.local for live vision AI.";
    }

    const barcode =
      analysis.barcode?.trim().replace(/\s/g, "") ||
      undefined;

    if (barcode) {
      databaseMatch = findMedicineByBarcode(barcode) ?? null;
    }

    return NextResponse.json({
      analysis,
      demoMode,
      message,
      databaseMatch,
      barcode: barcode ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Photo analysis failed" }, { status: 500 });
  }
}
