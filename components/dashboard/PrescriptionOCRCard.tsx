"use client";

import Link from "next/link";
import { ScanLine } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function PrescriptionOCRCard() {
  return (
    <Card variant="elevated" className="relative overflow-hidden">
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ScanLine className="h-4 w-4 text-primary" />
          Prescription OCR Scanner
        </CardTitle>
      </CardHeader>
      <p className="mb-4 text-sm text-muted">
        Upload a prescription image for AI-powered medicine extraction and dosage
        analysis.
      </p>
      <div className="mb-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ScanLine className="mx-auto h-10 w-10 text-primary/60" />
          <p className="mt-2 text-xs text-muted">AI scanning ready</p>
        </motion.div>
      </div>
      <ButtonLink href="/prescription-reader" size="sm" className="w-full">
        Open scanner
      </ButtonLink>
    </Card>
  );
}
