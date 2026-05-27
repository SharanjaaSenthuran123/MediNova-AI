"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Droplet,
  Pill,
  DollarSign,
  Brain,
  Activity,
  Users,
  AlertTriangle,
  Lock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

interface AdminOverview {
  stats: {
    users: number;
    patients: number;
    appointments: number;
    revenue: number;
    bloodRequests: number;
    pharmacyOrders: number;
    emergencyAlerts: number;
    bloodAlerts: number;
    donors: number;
    pharmacies: number;
  };
  demoMode?: boolean;
}

export function AdminDashboardClient() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [revenue, setRevenue] = useState<{ chart: { month: string; amount: number }[]; total: number } | null>(null);
  const [bloodBank, setBloodBank] = useState<{ requests: { bloodGroup: string; hospital: string; urgency: string }[]; alerts: { message: string }[] } | null>(null);
  const [pharmacy, setPharmacy] = useState<{ lowStock: { medicineName: string; stock: number }[]; orders: { totalAmount: number; status: string }[] } | null>(null);
  const [activity, setActivity] = useState<{ type: string; message: string; at: string }[]>([]);
  const [insights, setInsights] = useState<{ summary: string; recommendations: string[]; riskLevel: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);

  const load = useCallback(async () => {
    try {
      const session = await fetch("/api/auth/session", { credentials: "include" }).then((r) =>
        r.json()
      );
      if (session.user?.role !== "admin") {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const [ov, rev, bb, ph, act, ai] = await Promise.all([
        apiFetch<{
          stats: {
            users: number;
            patients: number;
            appointments: number;
            revenue: number;
            bloodPending: number;
            orders: number;
            emergencyAlerts: number;
            activeDonors: number;
            pharmacies: number;
          };
        }>("/api/admin/overview"),
        apiFetch<{ chart: { month: string; amount: number }[]; total: number }>("/api/admin/revenue"),
        apiFetch<{ requests: { bloodGroup: string; hospital: string; urgency: string }[]; alerts: { message: string }[] }>("/api/admin/blood-bank"),
        apiFetch<{ lowStock: { medicineName: string; stock: number }[]; orders: { totalAmount: number; status: string }[] }>("/api/admin/pharmacy"),
        apiFetch<{ logs: { type: string; message: string; at: string }[] }>("/api/admin/activity"),
        apiFetch<{ insights: { summary: string; recommendations: string[]; riskLevel: string } }>("/api/admin/ai-insights"),
      ]);

      setOverview({
        stats: {
          users: ov.stats.users,
          patients: ov.stats.patients,
          appointments: ov.stats.appointments,
          revenue: ov.stats.revenue,
          bloodRequests: ov.stats.bloodPending,
          pharmacyOrders: ov.stats.orders,
          emergencyAlerts: ov.stats.emergencyAlerts,
          bloodAlerts: ov.stats.emergencyAlerts,
          donors: ov.stats.activeDonors,
          pharmacies: ov.stats.pharmacies,
        },
      });
      setRevenue(rev);
      setBloodBank(bb);
      setPharmacy(ph);
      setActivity(act.logs);
      setInsights(ai.insights);
    } catch (err) {
      if (err instanceof Error && err.message.includes("403")) {
        setAuthorized(false);
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to load admin dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <EmptyState
        icon={Lock}
        title="Admin access required"
        description="Sign in with an admin account (admin@medinova.ai) to view this dashboard."
      />
    );
  }

  const stats = overview?.stats;

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Admin Dashboard"
        description="Real-time analytics, blood bank & pharmacy monitoring, revenue, and AI insights."
      />

      {overview?.demoMode && (
        <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning">
          Demo mode — connect MongoDB and seed data for live admin metrics.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {[
          { label: "Users", value: stats?.users ?? 0, icon: Users, color: "text-primary" },
          { label: "Revenue", value: `$${(stats?.revenue ?? 0).toFixed(0)}`, icon: DollarSign, color: "text-accent" },
          { label: "Blood Requests", value: stats?.bloodRequests ?? 0, icon: Droplet, color: "text-danger" },
          { label: "Pharmacy Orders", value: stats?.pharmacyOrders ?? 0, icon: Pill, color: "text-secondary" },
          { label: "Emergency Alerts", value: (stats?.emergencyAlerts ?? 0) + (stats?.bloodAlerts ?? 0), icon: AlertTriangle, color: "text-warning" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="glass">
              <div className="flex items-center gap-3 p-4">
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="glass p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <div className="h-56">
            {revenue && revenue.chart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue.chart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `$${Number(v ?? 0).toFixed(2)}`} />
                  <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted">No revenue data yet</p>
            )}
          </div>
        </Card>

        <Card className="glass p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          {insights ? (
            <div className="space-y-3 text-sm">
              <Badge variant={insights.riskLevel === "high" ? "danger" : insights.riskLevel === "medium" ? "warning" : "success"}>
                Risk: {insights.riskLevel}
              </Badge>
              <p>{insights.summary}</p>
              <ul className="list-inside list-disc space-y-1 text-muted">
                {insights.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted">Loading insights...</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="glass p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger">
              <Droplet className="h-5 w-5" />
              Blood Bank
            </CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {bloodBank?.alerts.slice(0, 3).map((a, i) => (
              <div key={i} className="rounded-lg bg-danger/10 px-3 py-2 text-danger">{a.message}</div>
            ))}
            {bloodBank?.requests.slice(0, 5).map((r, i) => (
              <div key={i} className="flex justify-between rounded-lg bg-white/30 px-3 py-2 dark:bg-white/5">
                <span>{r.bloodGroup} — {r.hospital}</span>
                <Badge variant="secondary">{r.urgency}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Pill className="h-5 w-5" />
              Pharmacy Monitor
            </CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-warning">Low Stock Items</p>
            {pharmacy?.lowStock.slice(0, 5).map((item, i) => (
              <div key={i} className="flex justify-between rounded-lg bg-white/30 px-3 py-2 dark:bg-white/5">
                <span>{item.medicineName}</span>
                <Badge variant="warning">{item.stock} left</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
            {activity.map((log, i) => (
              <div key={i} className="rounded-lg bg-white/30 px-3 py-2 dark:bg-white/5">
                <p>{log.message}</p>
                <p className="text-xs text-muted">{new Date(log.at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="glass mt-6 p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: "Patients", value: stats?.patients ?? 0 },
                { name: "Appointments", value: stats?.appointments ?? 0 },
                { name: "Donors", value: stats?.donors ?? 0 },
                { name: "Pharmacies", value: stats?.pharmacies ?? 0 },
              ]}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}
