"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, ScanLine, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";

const predictions = [
  { condition: "Cardiovascular risk", probability: 12, level: "low" },
  { condition: "Diabetes progression", probability: 8, level: "low" },
  { condition: "Sleep disorder", probability: 22, level: "moderate" },
];

export function AIDiseasePredictionCard() {
  return (
    <Card variant="gradient">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-5 w-5 text-primary" />
          AI Disease Prediction
        </CardTitle>
        <Badge variant="glass">
          <Sparkles className="mr-1 inline h-3 w-3" />
          AI v2.4
        </Badge>
      </CardHeader>

      <div className="space-y-3">
        {predictions.map((p, i) => (
          <motion.div
            key={p.condition}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl glass px-3 py-2.5"
          >
            <div className="flex items-center justify-between text-sm">
              <span>{p.condition}</span>
              <span className="font-semibold text-primary">{p.probability}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/60">
              <motion.div
                className="h-full rounded-full bg-gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${p.probability * 3}%` }}
                transition={{ duration: 1, delay: i * 0.15 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <ButtonLink href="/symptom-checker" size="sm" variant="outline">
          Run symptom check
        </ButtonLink>
        <Link
          href="/prescription-reader"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ScanLine className="h-4 w-4" />
          OCR scan
        </Link>
      </div>
    </Card>
  );
}
