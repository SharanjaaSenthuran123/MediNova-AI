"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { doctors } from "@/data/healthcareEntities";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

export function DoctorsShowcase() {
  const featured = doctors.slice(0, 4);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Trusted Doctors
            </h2>
            <p className="mt-2 text-muted">
              Top-rated specialists ready for in-person and virtual care
            </p>
          </div>
          <ButtonLink href="/doctors" variant="outline" size="sm">
            View all doctors
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((doctor, i) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card variant="elevated" interactive className="h-full">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                    {doctor.avatarInitials}
                  </span>
                  <div>
                    <p className="font-semibold">{doctor.name}</p>
                    <p className="text-sm text-muted">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-medium">{doctor.rating}</span>
                  <span className="text-muted">({doctor.reviews})</span>
                </div>
                <Badge
                  variant={
                    doctor.availability === "available"
                      ? "success"
                      : doctor.availability === "busy"
                        ? "warning"
                        : "default"
                  }
                  className="mt-3"
                >
                  {doctor.availability}
                </Badge>
                <Link
                  href="/appointments"
                  className={cn(
                    "mt-4 block text-center text-sm font-medium text-primary hover:underline"
                  )}
                >
                  Book appointment
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
