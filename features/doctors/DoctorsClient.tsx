"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Filter,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviews: number;
  experience: number;
  availability: "available" | "busy" | "offline";
  nextSlot: string;
  avatarInitials: string;
  patients: number;
}

const specialties = [
  "All",
  "General",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
];

function availabilityVariant(
  status: Doctor["availability"]
): "success" | "warning" | "default" {
  if (status === "available") return "success";
  if (status === "busy") return "warning";
  return "default";
}

export function DoctorsClient() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ doctors: Doctor[] }>("/api/doctors");
      setDoctors(data.doctors);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      specialty === "All"
        ? doctors
        : doctors.filter((d) => d.specialty === specialty),
    [doctors, specialty]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="sm">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted" />
          {specialties.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpecialty(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                specialty === s
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "glass text-muted hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((doctor, i) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card variant="elevated" interactive className="h-full">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-lg font-bold text-white shadow-glow">
                    {doctor.avatarInitials}
                  </span>
                  <div>
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-primary">{doctor.specialty}</p>
                    <p className="text-xs text-muted">{doctor.hospital}</p>
                  </div>
                </div>
                <Badge variant={availabilityVariant(doctor.availability)}>
                  {doctor.availability}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl glass px-2 py-2">
                  <Star className="mx-auto h-4 w-4 fill-warning text-warning" />
                  <p className="mt-1 font-semibold">{doctor.rating}</p>
                  <p className="text-muted">{doctor.reviews} reviews</p>
                </div>
                <div className="rounded-xl glass px-2 py-2">
                  <Clock className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-1 font-semibold">{doctor.experience}y</p>
                  <p className="text-muted">Experience</p>
                </div>
                <div className="rounded-xl glass px-2 py-2">
                  <Users className="mx-auto h-4 w-4 text-secondary" />
                  <p className="mt-1 font-semibold">{doctor.patients}</p>
                  <p className="text-muted">Patients</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl glass px-3 py-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-muted">Next slot:</span>
                <span className="font-medium">{doctor.nextSlot}</span>
              </div>

              <div className="mt-4">
                <Link href="/appointments">
                  <Button className="w-full" size="sm">
                    <Calendar className="h-4 w-4" />
                    Book appointment
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
