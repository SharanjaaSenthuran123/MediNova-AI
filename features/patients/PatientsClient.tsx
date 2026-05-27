"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingDown, TrendingUp, Activity, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, apiPost, ApiError } from "@/lib/api/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  status: "stable" | "monitoring" | "critical";
  healthScore: number;
  doctor: string;
  avatarInitials: string;
  lastVisit: string;
}

function statusVariant(
  status: PatientRecord["status"]
): "success" | "warning" | "danger" {
  if (status === "stable") return "success";
  if (status === "monitoring") return "warning";
  return "danger";
}

export function PatientsClient() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const canAddPatients = userRole === "doctor" || userRole === "admin";
  const [form, setForm] = useState({
    name: "",
    age: 30,
    gender: "Male",
    condition: "",
    status: "stable" as PatientRecord["status"],
    healthScore: 80,
    doctorName: "Dr. Priya Nair",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ patients: PatientRecord[] }>("/api/patients");
      setPatients(data.patients);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const session = await apiFetch<{ user?: { role?: string } }>("/api/auth/session");
        setUserRole(session.user?.role ?? null);
      } catch {
        setUserRole(null);
      }
    })();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!canAddPatients) {
      toast.error("Only doctors and admins can add patients", {
        description: "Sign in as doctor@medinova.ai or admin@medinova.ai to add records.",
      });
      return;
    }
    setSaving(true);
    try {
      await apiPost("/api/patients", {
        ...form,
        age: Number(form.age),
        healthScore: Number(form.healthScore),
      });
      toast.success("Patient added successfully");
      setShowForm(false);
      setForm({
        name: "",
        age: 30,
        gender: "Male",
        condition: "",
        status: "stable",
        healthScore: 80,
        doctorName: "Dr. Priya Nair",
      });
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        toast.error("Only doctors and admins can add patients", {
          description: "Use doctor@medinova.ai / demo123 with the Doctor role on login.",
        });
      } else if (err instanceof ApiError && err.status === 401) {
        toast.error("Please sign in again to add patients.");
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to add patient");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Patients", value: patients.length, icon: Activity },
            {
              label: "Critical",
              value: patients.filter((p) => p.status === "critical").length,
              icon: HeartPulse,
            },
            {
              label: "Avg Health Score",
              value: patients.length
                ? Math.round(
                    patients.reduce((a, p) => a + p.healthScore, 0) /
                      patients.length
                  )
                : 0,
              icon: TrendingUp,
            },
          ].map((stat) => (
            <Card key={stat.label} variant="elevated">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-icon">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Button
          onClick={() => {
            if (!canAddPatients) {
              toast.error("Only doctors and admins can add patients", {
                description: "Sign in as doctor@medinova.ai with the Doctor role.",
              });
              return;
            }
            setShowForm(!showForm);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add patient
        </Button>
      </div>

      {!canAddPatients && userRole && (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          Signed in as <strong>{userRole}</strong>. Patient records can only be created by a{" "}
          <strong>doctor</strong> or <strong>admin</strong>. Log out and sign in with{" "}
          <strong>doctor@medinova.ai</strong> / demo123, selecting the Doctor role.
        </p>
      )}

      {showForm && (
        <Card variant="elevated">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Condition"
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              required
            />
            <Input
              label="Age"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              required
            />
            <Select
              label="Gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as PatientRecord["status"],
                })
              }
            >
              <option value="stable">stable</option>
              <option value="monitoring">monitoring</option>
              <option value="critical">critical</option>
            </Select>
            <Input
              label="Assigned doctor"
              value={form.doctorName}
              onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
            />
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save patient"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card variant="elevated" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-primary/5 text-left">
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold">Condition</th>
                <th className="px-4 py-3 font-semibold">Doctor</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Health Score</th>
                <th className="px-4 py-3 font-semibold">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, i) => (
                <motion.tr
                  key={patient.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/40 transition-colors hover:bg-primary/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-white">
                        {patient.avatarInitials}
                      </span>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-xs text-muted">
                          {patient.age}y · {patient.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{patient.condition}</td>
                  <td className="px-4 py-3">{patient.doctor}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(patient.status)}>
                      {patient.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "flex items-center gap-1 font-semibold",
                        patient.healthScore >= 75
                          ? "text-success"
                          : patient.healthScore >= 60
                            ? "text-warning"
                            : "text-danger"
                      )}
                    >
                      {patient.healthScore >= 75 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {patient.healthScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{patient.lastVisit}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
