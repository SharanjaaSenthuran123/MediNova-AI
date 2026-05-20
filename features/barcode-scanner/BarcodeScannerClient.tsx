"use client";

import { useState } from "react";
import { BarcodeScanner } from "@/features/barcode-scanner/BarcodeScanner";
import { MedicineDetails } from "@/features/barcode-scanner/MedicineDetails";
import type { Medicine } from "@/types/medicine";

export function BarcodeScannerClient() {
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [barcode, setBarcode] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <BarcodeScanner
        onScan={(found, code) => {
          setMedicine(found);
          setBarcode(code);
        }}
      />
      <MedicineDetails medicine={medicine} barcode={barcode} />
    </div>
  );
}
