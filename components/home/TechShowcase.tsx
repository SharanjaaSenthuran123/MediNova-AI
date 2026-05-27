"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Dna,
  HeartPulse,
  ScanLine,
  Watch,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const techItems = [
  {
    icon: Brain,
    title: "AI Disease Prediction",
    description: "ML models analyze symptoms and vitals for early risk detection.",
  },
  {
    icon: ScanLine,
    title: "Prescription OCR",
    description: "Instant digitization of handwritten and printed prescriptions.",
  },
  {
    icon: HeartPulse,
    title: "Live ECG Monitoring",
    description: "Real-time cardiac waveform analysis with anomaly alerts.",
  },
  {
    icon: Dna,
    title: "Genomic Insights",
    description: "DNA-based personalized medicine recommendations.",
  },
  {
    icon: Watch,
    title: "Wearable Integration",
    description: "Sync smartwatch data for continuous health tracking.",
  },
];

export function TechShowcase() {
  return (
    <section className="bg-gradient-to-b from-primary/5 to-transparent py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold">Medical Technology Showcase</h2>
          <p className="mt-2 text-muted">
            Cutting-edge AI and IoT powering modern healthcare
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {techItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card variant="elevated" interactive>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl gradient-icon">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
