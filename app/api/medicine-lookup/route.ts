import { NextResponse } from "next/server";
import { z } from "zod";
import { findMedicineByBarcode } from "@/data/medicines";

const schema = z.object({
  barcode: z.string().min(1).max(50),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid barcode" },
        { status: 400 }
      );
    }

    const medicine = findMedicineByBarcode(parsed.data.barcode);

    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found", barcode: parsed.data.barcode },
        { status: 404 }
      );
    }

    return NextResponse.json({ medicine, demoMode: true });
  } catch {
    return NextResponse.json(
      { error: "Lookup failed" },
      { status: 500 }
    );
  }
}
