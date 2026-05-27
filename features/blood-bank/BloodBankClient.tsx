"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplet,
  AlertTriangle,
  Users,
  Heart,
  MapPin,
  Siren,
  Award,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { apiFetch, apiPost } from "@/lib/api/client";
import { getUserLocationWithFallback } from "@/lib/geolocation";
import { getSocket } from "@/components/providers/SocketProvider";
import { FeaturePageShell } from "@/components/layout/FeaturePageShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  BloodStockSummary,
  BloodRequest,
  Donor,
  BloodEmergencyAlert,
} from "@/types/bloodbank";
import { cn } from "@/lib/utils";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const statusColor = {
  critical: "#ef4444",
  low: "#f59e0b",
  adequate: "#22c55e",
};

export function BloodBankClient() {
  const [summary, setSummary] = useState<BloodStockSummary[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [alerts, setAlerts] = useState<BloodEmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [hospital, setHospital] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "urgent" | "critical">("urgent");

  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorCity, setDonorCity] = useState("");

  const load = useCallback(async () => {
    try {
      const [sumRes, reqRes, donorRes, alertRes] = await Promise.all([
        apiFetch<{ summary: BloodStockSummary[] }>("/api/blood-bank/stocks/summary"),
        apiFetch<{ requests: BloodRequest[] }>("/api/blood-bank/requests"),
        apiFetch<{ donors: Donor[] }>("/api/blood-bank/donors"),
        apiFetch<{ alerts: BloodEmergencyAlert[] }>("/api/blood-bank/alerts"),
      ]);
      setSummary(sumRes.summary);
      setRequests(reqRes.requests);
      setDonors(donorRes.donors);
      setAlerts(alertRes.alerts);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load blood bank data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onEmergency = (payload: { message: string; bloodGroup: string }) => {
      setShowSOS(true);
      toast.error("Blood Emergency", { description: payload.message });
      void load();
    };

    socket.on("bloodbank:emergency", onEmergency);
    socket.on("bloodbank:request", () => void load());

    return () => {
      socket.off("bloodbank:emergency", onEmergency);
      socket.off("bloodbank:request");
    };
  }, [load]);

  const submitRequest = async () => {
    if (!patientName || !hospital || !contactPhone) return;
    setSubmitting(true);
    try {
      const location = await getUserLocationWithFallback();
      await apiPost("/api/blood-bank/requests", {
        patientName,
        bloodGroup,
        unitsNeeded: Number(unitsNeeded),
        hospital,
        urgency,
        contactPhone,
        contactEmail: contactEmail || undefined,
        lat: location.lat,
        lng: location.lng,
      });
      toast.success("Blood request submitted");
      setPatientName("");
      setHospital("");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const registerDonor = async () => {
    if (!donorName || !donorEmail || !donorPhone) return;
    setSubmitting(true);
    try {
      const location = await getUserLocationWithFallback();
      const res = await apiPost<{ donor: Donor }>("/api/blood-bank/donors/register", {
        name: donorName,
        email: donorEmail,
        phone: donorPhone,
        bloodGroup,
        city: donorCity || "Metro City",
        lat: location.lat,
        lng: location.lng,
      });
      toast.success(`Registered! QR ID: ${res.donor.qrCodeId}`);
      setDonorName("");
      setDonorEmail("");
      setDonorPhone("");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <FeaturePageShell
      title="Smart Blood Bank System"
      description="Live blood stock tracking, emergency requests, donor matching, and SOS alerts."
      eyebrow="Blood Bank"
      disclaimerVariant="danger"
      disclaimerIcon={Siren}
      disclaimer="For life-threatening emergencies, call your local emergency number immediately."
    >
      <AnimatePresence>
        {(showSOS || alerts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-xl border border-danger/40 bg-gradient-to-r from-danger/20 to-danger/5 p-4"
          >
            <div className="flex items-center gap-2 text-danger">
              <Siren className="h-5 w-5 animate-pulse" />
              <span className="font-semibold">Active Emergency Alerts</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {alerts.map((a) => (
                <li key={a._id} className="flex items-center gap-2">
                  <Badge variant="danger">{a.bloodGroup}</Badge>
                  {a.message}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Blood Types Tracked", value: summary.length, icon: Droplet, color: "text-danger" },
          { label: "Active Requests", value: requests.filter((r) => r.status !== "fulfilled").length, icon: Heart, color: "text-primary" },
          { label: "Available Donors", value: donors.length, icon: Users, color: "text-accent" },
          { label: "Emergency Alerts", value: alerts.length, icon: AlertTriangle, color: "text-warning" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass">
              <div className="flex items-center gap-3 p-4">
                <stat.icon className={cn("h-8 w-8", stat.color)} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {summary.length > 0 && (
        <Card className="glass mb-6 p-4">
          <CardHeader><CardTitle>Blood Stock Overview</CardTitle></CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary}>
                <XAxis dataKey="bloodGroup" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="units" radius={[6, 6, 0, 0]}>
                  {summary.map((entry, i) => (
                    <Cell key={i} fill={statusColor[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {summary.map((s) => (
              <Badge
                key={s.bloodGroup}
                variant={s.status === "critical" ? "danger" : s.status === "low" ? "warning" : "success"}
              >
                {s.bloodGroup}: {s.units} units {s.isRare && "(Rare)"}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass p-4">
          <CardHeader><CardTitle>Emergency Blood Request</CardTitle></CardHeader>
          <div className="space-y-3">
            <Input placeholder="Patient name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            <Input placeholder="Contact phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            <Input placeholder="Contact email (optional)" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </Select>
              <Input placeholder="Units needed" type="number" min={1} value={unitsNeeded} onChange={(e) => setUnitsNeeded(e.target.value)} />
            </div>
            <Input placeholder="Hospital name" value={hospital} onChange={(e) => setHospital(e.target.value)} />
            <Select value={urgency} onChange={(e) => setUrgency(e.target.value as typeof urgency)}>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical SOS</option>
            </Select>
            <Button variant="danger" className="w-full" onClick={submitRequest} disabled={submitting}>
              {submitting ? <LoadingSpinner size="sm" /> : "Submit Blood Request"}
            </Button>
          </div>
        </Card>

        <Card className="glass p-4">
          <CardHeader><CardTitle>Donor Registration</CardTitle></CardHeader>
          <div className="space-y-3">
            <Input placeholder="Full name" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
            <Input placeholder="Email" type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} />
            <Input placeholder="Phone" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} />
            <Input placeholder="City" value={donorCity} onChange={(e) => setDonorCity(e.target.value)} />
            <Button className="w-full" onClick={registerDonor} disabled={submitting}>
              Register as Donor
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold">Recent Requests</h3>
          <div className="space-y-2">
            {requests.slice(0, 8).map((r) => (
              <Card key={r._id} className="glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.patientName} — {r.bloodGroup}</p>
                    <p className="text-xs text-muted flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{r.hospital}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={r.urgency === "critical" ? "danger" : "secondary"}>{r.urgency}</Badge>
                    {r.aiUrgencyScore && (
                      <p className="mt-1 text-xs text-muted">AI score: {r.aiUrgencyScore}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Award className="h-4 w-4 text-accent" />
            Top Donors
          </h3>
          <div className="space-y-2">
            {donors.slice(0, 8).map((d) => (
              <Card key={d._id} className="glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted">{d.bloodGroup} · {d.city}</p>
                  </div>
                  <Badge variant="success">{d.rewardPoints} pts</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </FeaturePageShell>
  );
}
