"use client";



import { useEffect, useState } from "react";

import { Radio, Siren } from "lucide-react";

import { Badge } from "@/components/ui/Badge";

import type { SimulationPhase } from "@/types/emergency";

import { cn } from "@/lib/utils";



interface EmergencyStatusBarProps {

  phase: SimulationPhase;

  startedAt?: number | null;

  simulation?: boolean;

  hasRealDelivery?: boolean;

}



function formatElapsed(ms: number): string {

  const totalSeconds = Math.floor(ms / 1000);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}



export function EmergencyStatusBar({

  phase,

  startedAt,

  simulation = true,

  hasRealDelivery = false,

}: EmergencyStatusBarProps) {

  const [elapsed, setElapsed] = useState(0);



  useEffect(() => {

    if (phase === "idle" || !startedAt) {

      setElapsed(0);

      return;

    }



    const tick = () => setElapsed(Date.now() - startedAt);

    tick();

    const id = setInterval(tick, 1000);

    return () => clearInterval(id);

  }, [phase, startedAt]);



  if (phase === "idle") return null;



  const isComplete = phase === "complete";



  return (

    <div

      className={cn(

        "animate-fade-in flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",

        isComplete

          ? hasRealDelivery

            ? "border-success/40 bg-success/10"

            : "border-warning/40 bg-warning/10"

          : "border-danger/40 bg-danger/10"

      )}

      role="status"

      aria-live="polite"

    >

      <div className="flex items-center gap-3">

        <span

          className={cn(

            "flex h-9 w-9 items-center justify-center rounded-lg",

            isComplete

              ? hasRealDelivery

                ? "bg-success/15 text-success"

                : "bg-warning/15 text-warning"

              : "bg-danger/15 text-danger"

          )}

        >

          {isComplete ? (

            <Radio className="h-4 w-4" />

          ) : (

            <Siren className={cn("h-4 w-4", !isComplete && "animate-pulse")} />

          )}

        </span>

        <div>

          <p className="text-sm font-semibold text-foreground">

            {isComplete

              ? hasRealDelivery

                ? "Alert complete — real notifications sent"

                : "Alert complete — simulation only"

              : "Emergency protocol active"}

          </p>

          <p className="text-xs text-muted">

            {isComplete

              ? simulation

                ? "Timeline finished · check delivery report below"

                : "SMS/email delivered where configured"

              : "Location lock · Caretaker alerts · Dispatch simulation"}

          </p>

        </div>

      </div>



      <div className="flex flex-wrap items-center gap-2">

        {!isComplete && (

          <Badge variant="danger" className="gap-1.5">

            <span className="emergency-status-pulse h-2 w-2 rounded-full bg-danger" />

            LIVE

          </Badge>

        )}

        {startedAt && (

          <Badge variant="outline" className="font-mono tabular-nums">

            {formatElapsed(elapsed)}

          </Badge>

        )}

        <Badge variant={simulation && !hasRealDelivery ? "warning" : "success"}>

          {hasRealDelivery ? "Real + sim" : simulation ? "Simulation" : "Live delivery"}

        </Badge>

      </div>

    </div>

  );

}


