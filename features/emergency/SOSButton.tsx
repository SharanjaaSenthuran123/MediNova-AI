"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Siren } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SOSButtonProps {
  onActivate: () => void;
  disabled?: boolean;
  /** When true, skip the countdown and activate immediately (for demo chips). */
  instant?: boolean;
  /** Dramatic red glow when emergency simulation is running */
  emergencyActive?: boolean;
}

const COUNTDOWN_SECONDS = 5;
const RING_RADIUS = 88;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function SOSButton({
  onActivate,
  disabled,
  instant,
  emergencyActive,
}: SOSButtonProps) {
  const [arming, setArming] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onActivateRef = useRef(onActivate);

  useEffect(() => {
    onActivateRef.current = onActivate;
  }, [onActivate]);

  const finishCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setArming(false);
    setCountdown(COUNTDOWN_SECONDS);
    onActivateRef.current();
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setArming(false);
    setCountdown(COUNTDOWN_SECONDS);
  }, []);

  const startCountdown = useCallback(() => {
    setArming(true);
    setCountdown(COUNTDOWN_SECONDS);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          window.setTimeout(finishCountdown, 0);
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
  }, [finishCountdown]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const ringProgress =
    arming ? (COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringProgress);
  const urgentCountdown = arming && countdown <= 2;

  const buttonCore = (
    <span
      className={cn(
        "relative z-10 flex h-36 w-36 items-center justify-center rounded-full bg-danger text-white transition-all duration-300",
        !disabled && !arming && !emergencyActive && "sos-glow-danger",
        emergencyActive && "scale-95 opacity-90",
        arming && urgentCountdown && "sos-countdown-shake sos-glow-danger"
      )}
    >
      <span className="absolute inset-2 rounded-full border-4 border-white/25" />
      <span className="flex flex-col items-center gap-1">
        <Siren className={cn("h-10 w-10", (arming || emergencyActive) && "animate-pulse")} />
        <span className="text-lg font-bold tracking-widest">SOS</span>
      </span>
    </span>
  );

  if (instant) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-44 w-44 items-center justify-center" aria-hidden>
          <span className="absolute inset-0 rounded-full border-2 border-danger/40 sos-ripple-ring" />
          <span className="absolute inset-0 rounded-full border-2 border-danger/30 sos-ripple-ring-delay-1" />
          {buttonCore}
        </div>
        <p className="text-sm font-medium text-danger animate-pulse">
          Quick demo — activating alert…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-48 w-48 items-center justify-center">
        {!disabled && !arming && !emergencyActive && (
          <>
            <span className="absolute inset-2 rounded-full border-2 border-danger/35 sos-ripple-ring" />
            <span className="absolute inset-2 rounded-full border-2 border-danger/25 sos-ripple-ring-delay-1" />
            <span className="absolute inset-2 rounded-full border-2 border-danger/15 sos-ripple-ring-delay-2" />
          </>
        )}

        {arming && (
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 192 192"
            aria-hidden
          >
            <circle
              cx="96"
              cy="96"
              r={RING_RADIUS}
              fill="none"
              stroke="rgb(239 68 68 / 0.15)"
              strokeWidth="6"
            />
            <circle
              cx="96"
              cy="96"
              r={RING_RADIUS}
              fill="none"
              stroke="rgb(239 68 68)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
        )}

        <button
          type="button"
          disabled={disabled || arming}
          onClick={startCountdown}
          className={cn(
            "relative rounded-full transition-transform",
            "hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger/40"
          )}
          aria-label="Emergency SOS"
        >
          {buttonCore}
        </button>
      </div>

      {arming ? (
        <div className="text-center animate-fade-in">
          <p
            className={cn(
              "text-4xl font-bold tabular-nums",
              urgentCountdown ? "text-danger sos-countdown-shake" : "text-danger"
            )}
          >
            {countdown}
          </p>
          <p className="mt-1 text-sm font-medium text-muted">
            {urgentCountdown ? "Alert firing…" : "Sending alert in…"}
          </p>
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
