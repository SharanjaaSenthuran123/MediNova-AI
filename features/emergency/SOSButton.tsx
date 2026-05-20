"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Siren } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SOSButtonProps {
  onActivate: () => void;
  disabled?: boolean;
}

const COUNTDOWN_SECONDS = 5;

export function SOSButton({ onActivate, disabled }: SOSButtonProps) {
  const [arming, setArming] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setArming(false);
    setCountdown(COUNTDOWN_SECONDS);
  }, []);

  const startCountdown = useCallback(() => {
    setArming(true);
    setCountdown(COUNTDOWN_SECONDS);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setArming(false);
          onActivate();
          return COUNTDOWN_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onActivate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        disabled={disabled || arming}
        onClick={startCountdown}
        className={cn(
          "group relative flex h-40 w-40 items-center justify-center rounded-full bg-danger text-white shadow-lg transition-transform",
          "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger/40",
          !disabled && !arming && "animate-pulse-slow"
        )}
        aria-label="Emergency SOS"
      >
        <span className="absolute inset-2 rounded-full border-4 border-white/30" />
        <span className="flex flex-col items-center gap-1">
          <Siren className="h-10 w-10" />
          <span className="text-lg font-bold tracking-wide">SOS</span>
        </span>
      </button>

      {arming ? (
        <div className="text-center">
          <p className="text-3xl font-bold text-danger">{countdown}</p>
          <p className="mt-1 text-sm text-muted">Sending alert in...</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={cancel}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <p className="max-w-xs text-center text-sm text-muted">
          Tap to start a {COUNTDOWN_SECONDS}-second countdown. This is a demo
          simulation — no real alerts are sent.
        </p>
      )}
    </div>
  );
}
