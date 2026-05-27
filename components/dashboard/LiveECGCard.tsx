"use client";

import { motion } from "framer-motion";
import { ECGAnimation } from "@/components/auth/ECGAnimation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function LiveECGCard() {
  return (
    <Card variant="elevated">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          Live ECG Monitoring
        </CardTitle>
        <Badge variant="success">Normal rhythm</Badge>
      </CardHeader>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ECGAnimation />
      </motion.div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg glass px-2 py-2">
          <p className="font-semibold text-primary">72</p>
          <p className="text-muted">BPM</p>
        </div>
        <div className="rounded-lg glass px-2 py-2">
          <p className="font-semibold text-secondary">98%</p>
          <p className="text-muted">SpO2</p>
        </div>
        <div className="rounded-lg glass px-2 py-2">
          <p className="font-semibold text-success">118/76</p>
          <p className="text-muted">BP</p>
        </div>
      </div>
    </Card>
  );
}
