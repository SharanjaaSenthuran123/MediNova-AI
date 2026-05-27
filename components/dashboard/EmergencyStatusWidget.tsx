"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, ShieldCheck, Siren } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { emergencyContacts } from "@/data/dashboardStats";

export function EmergencyStatusWidget() {
  const allActive = emergencyContacts.every((c) => c.status === "active");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12 }}
    >
      <Card
        variant="elevated"
        className="h-full border-danger/15 hover:shadow-[0_0_36px_rgb(239_68_68_/_0.15)]"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Siren className="h-4 w-4 text-danger" />
            Emergency Status
          </CardTitle>
          <CardDescription>SOS simulation readiness</CardDescription>
        </CardHeader>

        <section className="flex items-center gap-3 rounded-xl glass px-4 py-3">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              allActive ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
            }`}
          >
            <ShieldCheck className="h-6 w-6" />
          </span>
          <section className="min-w-0 flex-1">
            <p className="font-semibold">
              {allActive ? "All contacts active" : "Action needed"}
            </p>
            <p className="text-xs text-muted">
              {emergencyContacts.length} on file · Location sim ready
            </p>
          </section>
          <Badge variant={allActive ? "success" : "warning"}>
            {allActive ? "Ready" : "Review"}
          </Badge>
        </section>

        <ul className="mt-3 space-y-2">
          {emergencyContacts.map((contact) => (
            <li
              key={contact.phone}
              className="flex items-center justify-between text-xs"
            >
              <span className="truncate text-muted">
                {contact.name} · {contact.relation}
              </span>
              <span className="flex items-center gap-1 text-success">
                <Phone className="h-3 w-3" />
                Active
              </span>
            </li>
          ))}
        </ul>

        <Link href="/emergency" className="mt-4 inline-block w-full">
          <Button size="sm" variant="outline" className="w-full border-danger/30">
            Open SOS
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}
