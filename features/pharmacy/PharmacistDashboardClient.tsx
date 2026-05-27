"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Package, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, apiPatch } from "@/lib/api/client";
import { FeaturePageShell } from "@/components/layout/FeaturePageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { DeliveryOrder } from "@/types/pharmacy";
import { orderStatusLabel } from "@/types/pharmacy";

interface PrescriptionQueueItem {
  id: string;
  userId: { id: string; name: string } | string;
  medicines: string[];
  rawTextPreview: string;
  status: string;
  createdAt: string;
}

export function PharmacistDashboardClient() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionQueueItem[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);

  const load = useCallback(async () => {
    try {
      const session = await fetch("/api/auth/session", { credentials: "include" }).then((r) =>
        r.json()
      );
      if (!["pharmacy", "admin", "doctor"].includes(session.user?.role)) {
        setAuthorized(false);
        return;
      }

      const [rx, ord] = await Promise.all([
        apiFetch<{ prescriptions: PrescriptionQueueItem[] }>("/api/pharmacist/prescriptions"),
        apiFetch<{ orders: DeliveryOrder[] }>("/api/pharmacist/orders"),
      ]);
      setPrescriptions(rx.prescriptions);
      setOrders(ord.orders);
    } catch {
      toast.error("Failed to load pharmacist dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reviewRx = async (id: string, status: "approved" | "rejected") => {
    await apiPatch(`/api/pharmacist/prescriptions/${id}`, { status });
    toast.success(`Prescription ${status}`);
    void load();
  };

  const updateOrder = async (id: string, status: DeliveryOrder["status"]) => {
    await apiPatch(`/api/pharmacist/orders/${id}/status`, { status });
    toast.success(`Order marked ${status}`);
    void load();
  };

  if (!authorized) {
    return (
      <FeaturePageShell
        title="Pharmacist Dashboard"
        description="Pharmacist or admin access required."
      >
        <Card className="glass p-8 text-center text-muted">
          Pharmacist or admin access required.
        </Card>
      </FeaturePageShell>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <FeaturePageShell
      title="Pharmacist Dashboard"
      description="Review prescriptions and manage active pharmacy orders."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <ClipboardList className="h-5 w-5" /> Prescription queue
          </h2>
          {prescriptions.length === 0 ? (
            <Card className="glass p-6 text-sm text-muted">No pending prescriptions.</Card>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <Card key={rx.id} className="glass p-4">
                  <p className="font-medium">
                    {typeof rx.userId === "object" ? rx.userId.name : "Patient"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{rx.rawTextPreview}</p>
                  <p className="mt-1 text-sm">{rx.medicines.join(", ")}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => void reviewRx(rx.id, "approved")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void reviewRx(rx.id, "rejected")}>
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5" /> Active orders
          </h2>
          {orders.length === 0 ? (
            <Card className="glass p-6 text-sm text-muted">No active orders.</Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order._id} className="glass p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-muted">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <Badge variant="outline">{orderStatusLabel(order.status)}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(["confirmed", "packed", "dispatched", "delivered"] as const).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={order.status === s ? "secondary" : "outline"}
                        onClick={() => void updateOrder(order._id, s)}
                      >
                        {orderStatusLabel(s)}
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </FeaturePageShell>
  );
}
