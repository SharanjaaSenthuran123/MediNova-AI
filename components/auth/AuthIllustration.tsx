"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Ambulance,
  Brain,
  Cross,
  Dna,
  HeartPulse,
  Pill,
  Stethoscope,
  Watch,
} from "lucide-react";
import { AIHealthcareIllustration } from "@/components/homepage/AIHealthcareIllustration";
import { ECGAnimation } from "@/components/auth/ECGAnimation";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const floatingIcons = [
  { Icon: Stethoscope, x: "8%", y: "15%", delay: 0 },
  { Icon: HeartPulse, x: "85%", y: "20%", delay: 0.5 },
  { Icon: Pill, x: "12%", y: "75%", delay: 1 },
  { Icon: Brain, x: "88%", y: "70%", delay: 1.5 },
  { Icon: Dna, x: "75%", y: "45%", delay: 0.8 },
  { Icon: Ambulance, x: "5%", y: "45%", delay: 1.2 },
  { Icon: Watch, x: "50%", y: "8%", delay: 0.3 },
  { Icon: Cross, x: "92%", y: "88%", delay: 0.6 },
];

export function AuthIllustration() {
  return (
    <div className="relative hidden h-full min-h-[600px] overflow-hidden lg:flex lg:flex-col lg:justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/15" />
      <div className="absolute inset-0 hero-animated-bg opacity-80" />

      {floatingIcons.map(({ Icon, x, y, delay }, i) => (
        <motion.span
          key={i}
          className="absolute rounded-2xl glass p-3 shadow-glass"
          style={{ left: x, top: y }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay }}
        >
          <Icon className="h-6 w-6 text-primary/70" />
        </motion.span>
      ))}

      <div className="relative z-10 flex flex-col items-center px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-primary">
            <Activity className="h-4 w-4" />
            AI-Powered Healthcare Platform
          </div>
          <h2 className="text-3xl font-bold text-foreground xl:text-4xl">
            {APP_NAME}
          </h2>
          <p className="mt-3 max-w-md text-lg text-muted">{APP_TAGLINE}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <AIHealthcareIllustration />
        </motion.div>

        <motion.div
          className="mt-8 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ECGAnimation />
        </motion.div>

        <motion.div
          className="mt-6 grid w-full max-w-md grid-cols-3 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { label: "Patients", value: "12K+" },
            { label: "Doctors", value: "850+" },
            { label: "AI Accuracy", value: "98.5%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl glass px-3 py-3 text-center"
            >
              <p className="text-lg font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
