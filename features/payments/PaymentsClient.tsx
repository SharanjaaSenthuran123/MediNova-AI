"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  FileText,
  Receipt,
  Crown,
  Heart,
  Pill,
  Calendar,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { apiFetch, apiPost } from "@/lib/api/client";
import { FeaturePageShell } from "@/components/layout/FeaturePageShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PaymentRecord, Invoice, Subscription, PaymentProvider, PaymentPurpose } from "@/types/payment";

const PURPOSE_OPTIONS: { value: PaymentPurpose; label: string; icon: typeof Calendar }[] = [
  { value: "appointment", label: "Doctor Appointment", icon: Calendar },
  { value: "medicine", label: "Medicine Purchase", icon: Pill },
  { value: "subscription", label: "Premium Subscription", icon: Crown },
  { value: "donation", label: "Donation Campaign", icon: Heart },
];

const PROVIDERS: { value: PaymentProvider; label: string }[] = [
  { value: "stripe", label: "Stripe" },
  { value: "payhere", label: "PayHere" },
  { value: "paypal", label: "PayPal" },
];

const CHART_COLORS = ["#2563eb", "#06b6d4", "#22c55e", "#f59e0b"];

export function PaymentsClient() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalSpent: number;
    byPurpose: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [amount, setAmount] = useState("49.99");
  const [purpose, setPurpose] = useState<PaymentPurpose>("appointment");
  const [provider, setProvider] = useState<PaymentProvider>("stripe");

  const load = useCallback(async () => {
    try {
      const [histRes, subRes, analyticsRes] = await Promise.all([
        apiFetch<{ payments: PaymentRecord[]; invoices: Invoice[] }>("/api/payments/history"),
        apiFetch<{ subscriptions: Subscription[] }>("/api/payments/subscriptions"),
        apiFetch<{ analytics: { totalSpent: number; byPurpose: Record<string, number> } }>(
          "/api/payments/analytics"
        ),
      ]);
      setPayments(histRes.payments);
      setInvoices(histRes.invoices);
      setSubscriptions(subRes.subscriptions);
      setAnalytics(analyticsRes.analytics);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const checkout = async () => {
    setProcessing(true);
    try {
      const res = await apiPost<{
        payment: PaymentRecord;
        clientSecret?: string;
        checkoutUrl?: string;
      }>("/api/payments/checkout", {
        amount: Number(amount),
        purpose,
        provider,
        currency: "USD",
        metadata: purpose === "subscription" ? { plan: "premium" } : {},
      });

      if (res.checkoutUrl) {
        window.open(res.checkoutUrl, "_blank");
      }

      await apiPost("/api/payments/confirm", { paymentId: res.payment._id });
      toast.success("Payment completed", {
        description: `$${Number(amount).toFixed(2)} via ${provider}`,
      });
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const cancelSub = async (id: string) => {
    try {
      await apiPost("/api/payments/subscriptions/cancel", { subscriptionId: id });
      toast.success("Subscription cancelled");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  const chartData = analytics
    ? Object.entries(analytics.byPurpose).map(([name, value]) => ({ name, value }))
    : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <FeaturePageShell
      title="Payments & Billing"
      description="Secure payments for appointments, medicines, subscriptions, and donations."
      eyebrow="Billing"
      disclaimer="Payments are processed securely via Stripe, PayHere, or PayPal. Demo mode confirms locally when gateway keys are not configured."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              New Payment
            </CardTitle>
          </CardHeader>
          <div className="space-y-4 px-6 pb-6">
            <Input
              label="Amount (USD)"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Purpose</label>
              <Select value={purpose} onChange={(e) => setPurpose(e.target.value as PaymentPurpose)}>
                {PURPOSE_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Provider</label>
              <Select value={provider} onChange={(e) => setProvider(e.target.value as PaymentProvider)}>
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
            <Button className="w-full" onClick={checkout} disabled={processing}>
              {processing ? <LoadingSpinner size="sm" /> : "Pay Now"}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total Spent", value: `$${(analytics?.totalSpent ?? 0).toFixed(2)}`, icon: Receipt },
              { label: "Transactions", value: payments.length, icon: CreditCard },
              { label: "Active Subs", value: subscriptions.filter((s) => s.status === "active").length, icon: Crown },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass p-4">
                  <stat.icon className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {chartData.length > 0 && (
            <Card className="glass p-4">
              <CardHeader><CardTitle>Spending by Category</CardTitle></CardHeader>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `$${Number(v ?? 0).toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold">Payment History</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {payments.map((p) => (
              <Card key={p._id} className="glass p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">${p.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted capitalize">{p.purpose} · {p.provider}</p>
                  </div>
                  <Badge variant={p.status === "completed" ? "success" : "secondary"}>{p.status}</Badge>
                </div>
              </Card>
            ))}
            {payments.length === 0 && (
              <Card className="glass p-6 text-center text-sm text-muted">No payments yet</Card>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <FileText className="h-4 w-4" />
            Invoices & Subscriptions
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {invoices.map((inv) => (
              <Card key={inv._id} className="glass p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted">{inv.description}</p>
                  </div>
                  <p className="font-semibold">${inv.amount.toFixed(2)}</p>
                </div>
              </Card>
            ))}
            {subscriptions.map((sub) => (
              <Card key={sub._id} className="glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{sub.plan} Plan</p>
                    <p className="text-xs text-muted">{sub.provider} · ${sub.amount}/mo</p>
                  </div>
                  {sub.status === "active" ? (
                    <Button variant="outline" size="sm" onClick={() => cancelSub(sub._id)}>
                      Cancel
                    </Button>
                  ) : (
                    <Badge variant="secondary">{sub.status}</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </FeaturePageShell>
  );
}
