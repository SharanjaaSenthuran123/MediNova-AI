"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Ambulance, Phone, Siren } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function EmergencyBanner() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-danger/90 to-red-600 p-8 text-white shadow-glow-lg sm:p-12"
        >
          <div className="absolute right-0 top-0 opacity-20">
            <Ambulance className="h-48 w-48 -translate-y-8 translate-x-8" />
          </div>
          <div className="relative max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm">
              <Siren className="h-4 w-4" />
              24/7 Emergency Support
            </div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Instant emergency response when every second counts
            </h2>
            <p className="mt-4 text-white/90">
              One-tap SOS alerts, ambulance tracking, and automatic contact
              notification — simulated for demo purposes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink
                href="/emergency"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                <Siren className="h-4 w-4" />
                Emergency SOS
              </ButtonLink>
              <Link
                href="tel:911"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2 text-sm font-medium hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                Call 911
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
