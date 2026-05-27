"use client";

import { motion } from "framer-motion";
import { Check, Clock, Pill } from "lucide-react";
import { medicineSchedule } from "@/data/dashboardStats";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function MedicineTimelineCard() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Pill className="h-4 w-4 text-primary" />
          Medicine Reminder Timeline
        </CardTitle>
      </CardHeader>

      <div className="relative space-y-0 pl-6">
        <div className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

        {medicineSchedule.map((med, i) => (
          <motion.div
            key={med.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pb-4 last:pb-0"
          >
            <span
              className={cn(
                "absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2",
                med.taken
                  ? "border-success bg-success text-white"
                  : "border-primary/30 bg-card"
              )}
            >
              {med.taken ? (
                <Check className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3 text-muted" />
              )}
            </span>
            <div className="rounded-xl glass px-3 py-2">
              <p className="text-sm font-medium">{med.name}</p>
              <p className="text-xs text-muted">{med.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
