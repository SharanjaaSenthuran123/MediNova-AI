import { NextResponse } from "next/server";
import { z } from "zod";
import { isOpenAIConfigured } from "@/lib/env";
import { analyzePrescriptionWithOpenAI } from "@/lib/openai-prescription-ocr";
import { getDemoOCRResult } from "@/features/prescription-reader/ocr.helpers";

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

    if (!isOpenAIConfigured()) {
      const demo = getDemoOCRResult(0);
      return NextResponse.json({
        ...demo,
        demoMode: true,
        message:
          "OpenAI API key not configured — showing sample prescription. Add OPENAI_API_KEY to .env.local for accurate live reading.",
      });
    }

    try {
      const result = await analyzePrescriptionWithOpenAI(parsed.data.imageBase64);
      return NextResponse.json({ ...result, demoMode: false });
    } catch (err) {
      console.error("OpenAI prescription OCR failed:", err);
      return NextResponse.json(
        {
          error:
            "AI prescription reading failed. Try a clearer photo or use browser OCR fallback.",
        },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process prescription image" },
      { status: 500 }
    );
  }
}
