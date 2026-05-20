"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, CameraOff, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { findMedicineByBarcode } from "@/data/medicines";
import type { Medicine } from "@/types/medicine";

interface ScannerControls {
  stop: () => void;
}

interface BarcodeScannerProps {
  onScan: (medicine: Medicine | null, barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<ScannerControls | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraActive(false);
  }, []);

  const lookupBarcode = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;
      setLastScanned(trimmed);
      const medicine = findMedicineByBarcode(trimmed) ?? null;
      onScan(medicine, trimmed);
    },
    [onScan]
  );

  const startCamera = useCallback(async () => {
    setStarting(true);
    setCameraError(null);

    try {
      const reader = new BrowserMultiFormatReader();

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const backCamera =
        devices.find((d) => /back|rear|environment/i.test(d.label)) ??
        devices[0];

      if (!backCamera) {
        setCameraError("No camera found. Use manual barcode entry below.");
        return;
      }

      if (!videoRef.current) return;

      const controls = await reader.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current,
        (result) => {
          if (result) {
            lookupBarcode(result.getText());
            controlsRef.current?.stop();
            controlsRef.current = null;
            setCameraActive(false);
          }
        }
      );

      controlsRef.current = controls;
      setCameraActive(true);
    } catch {
      setCameraError(
        "Camera access denied or unavailable. Use manual entry below."
      );
    } finally {
      setStarting(false);
    }
  }, [lookupBarcode]);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  return (
    <Card className="space-y-4">
      <div className="relative overflow-hidden rounded-xl bg-black/90">
        <video
          ref={videoRef}
          className="aspect-[4/3] w-full object-cover"
          muted
          playsInline
        />

        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 p-6 text-center">
            <ScanBarcode className="h-12 w-12 text-primary" />
            <p className="text-sm text-muted">
              Point your camera at a medicine barcode
            </p>
          </div>
        )}

        {cameraActive && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="scanner-frame h-40 w-56 rounded-lg border-2 border-primary/60" />
          </div>
        )}
      </div>

      {cameraError && (
        <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-foreground">
          <CameraOff className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          {cameraError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!cameraActive ? (
          <Button
            type="button"
            onClick={startCamera}
            disabled={starting}
            className="flex-1"
          >
            {starting ? (
              <>
                <LoadingSpinner size="sm" />
                Starting camera...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Start scanner
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={stopCamera}
            className="flex-1"
          >
            Stop camera
          </Button>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-2 text-sm font-medium">Manual barcode entry</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. 8901234567890"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookupBarcode(manualCode)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => lookupBarcode(manualCode)}
          >
            Lookup
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Demo codes: 8901234567890 (Paracetamol), 8901234567891 (Amoxicillin)
        </p>
        {lastScanned && (
          <p className="mt-1 text-xs text-muted">
            Last scanned: <code>{lastScanned}</code>
          </p>
        )}
      </div>
    </Card>
  );
}
