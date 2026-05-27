"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  MapPin,
  Package,
  Truck,
  XCircle,
  FileText,
  RotateCcw,
  Clock,
} from "lucide-react";
import { apiPost } from "@/lib/api/client";
import type { DeliveryOrder, OrderStatus } from "@/types/pharmacy";
import { ORDER_STATUS_STEPS, orderStatusLabel } from "@/types/pharmacy";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { LiveDeliveryMap } from "@/features/pharmacy/LiveDeliveryMap";
import { toast } from "sonner";

interface OrderTrackingPanelProps {
  orders: DeliveryOrder[];
  loading?: boolean;
  onRefresh: () => void;
  onCancel?: (orderId: string) => void;
  onRepeatOrder?: (orderId: string) => void;
  cancellingId?: string | null;
}

function statusVariant(status: OrderStatus) {
  if (status === "delivered") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "dispatched" || status === "packed") return "secondary" as const;
  return "outline" as const;
}

function stepIndex(status: OrderStatus) {
  if (status === "cancelled") return -1;
  const idx = ORDER_STATUS_STEPS.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function formatEta(order: DeliveryOrder) {
  if (order.estimatedDeliveryAt) {
    const eta = new Date(order.estimatedDeliveryAt);
    const mins = order.estimatedMinutes;
    return mins
      ? `~${mins} min · ${eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : eta.toLocaleString();
  }
  if (order.estimatedMinutes) return `~${order.estimatedMinutes} min`;
  return null;
}

export function OrderTrackingPanel({
  orders,
  loading,
  onRefresh,
  onCancel,
  onRepeatOrder,
  cancellingId,
}: OrderTrackingPanelProps) {
  const [returnReason, setReturnReason] = useState<Record<string, string>>({});
  const [returningId, setReturningId] = useState<string | null>(null);

  const payNow = async (order: DeliveryOrder) => {
    try {
      const provider =
        order.paymentMethod === "stripe"
          ? "stripe"
          : order.paymentMethod === "paypal"
            ? "paypal"
            : order.paymentMethod === "payhere"
              ? "payhere"
              : "stripe";

      const res = await apiPost<{ checkoutUrl?: string; clientSecret?: string }>(
        "/api/payments/checkout",
        {
          amount: order.totalAmount,
          provider,
          purpose: "medicine",
          referenceId: order._id,
          metadata: { orderId: order._id },
        }
      );

      if (res.checkoutUrl) {
        window.open(res.checkoutUrl, "_blank");
        toast.message("Complete payment in the new tab");
      } else {
        toast.success("Payment initiated", {
          description: "Your order will update once payment clears.",
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    }
  };

  const requestReturn = async (orderId: string) => {
    const reason = returnReason[orderId]?.trim();
    if (!reason || reason.length < 5) {
      toast.error("Please enter a return reason (min 5 characters)");
      return;
    }
    setReturningId(orderId);
    try {
      await apiPost(`/api/orders/medicines/orders/${orderId}/return`, { reason });
      toast.success("Return request submitted");
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Return request failed");
    } finally {
      setReturningId(null);
    }
  };

  const downloadInvoice = (orderId: string) => {
    window.open(`/api/orders/medicines/orders/${orderId}/invoice`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="glass p-10 text-center text-muted">
        <Package className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p className="font-medium text-foreground">No orders yet</p>
        <p className="mt-1 text-sm">Your online medicine orders will appear here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Order history</h3>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {orders.map((order) => {
        const currentStep = stepIndex(order.status);
        const isCancelled = order.status === "cancelled";
        const eta = formatEta(order);
        const canReturn =
          order.status === "delivered" &&
          (!order.returnStatus || order.returnStatus === "none" || order.returnStatus === "rejected");

        return (
          <Card key={order._id} className="glass p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  Order #{order._id.slice(-6).toUpperCase()}
                  {order.invoiceNumber && (
                    <span className="ml-2 text-xs font-normal text-muted">
                      {order.invoiceNumber}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  {new Date(order.createdAt).toLocaleString()}
                  {order.pharmacyId?.name ? ` · ${order.pharmacyId.name}` : ""}
                </p>
                {eta && !isCancelled && order.status !== "delivered" && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                    <Clock className="h-3.5 w-3.5" />
                    ETA: {eta}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={statusVariant(order.status)}>{orderStatusLabel(order.status)}</Badge>
                <Badge variant="outline">{order.paymentStatus}</Badge>
                {order.returnStatus && order.returnStatus !== "none" && (
                  <Badge variant="warning">Return: {order.returnStatus}</Badge>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              {order.items.map((item, i) => (
                <div key={`${order._id}-${i}`} className="flex justify-between gap-2">
                  <span>
                    {item.medicineName} ×{item.quantity}
                  </span>
                  <span className="text-muted">${item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <p className="mt-2 text-right font-semibold text-primary">
              ${order.totalAmount.toFixed(2)}
            </p>

            {order.deliveryAddress && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {order.deliveryAddress}
              </p>
            )}

            {order.deliveryAgent && order.status === "dispatched" && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-secondary">
                <Truck className="h-3.5 w-3.5" />
                {order.deliveryAgent.name} · {order.deliveryAgent.phone}
              </p>
            )}

            {order.status === "dispatched" && (
              <div className="mt-3">
                <LiveDeliveryMap
                  orderId={order._id}
                  userLat={order.userLocation.lat}
                  userLng={order.userLocation.lng}
                  agentLocation={order.agentLocation}
                  pharmacyLat={order.pharmacyId?.lat}
                  pharmacyLng={order.pharmacyId?.lng}
                />
              </div>
            )}

            {!isCancelled && (
              <div className="mt-4 flex flex-wrap gap-2">
                {ORDER_STATUS_STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  return (
                    <div
                      key={step}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                        done
                          ? "bg-primary/10 text-primary"
                          : "bg-white/30 text-muted dark:bg-white/5"
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className={cn("h-3.5 w-3.5", active && "animate-pulse")} />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                      {orderStatusLabel(step)}
                    </div>
                  );
                })}
              </div>
            )}

            {isCancelled && (
              <div className="mt-3 flex items-center gap-2 text-sm text-danger">
                <XCircle className="h-4 w-4" />
                This order was cancelled
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {order.status === "pending" && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(order._id)}
                  disabled={cancellingId === order._id}
                >
                  {cancellingId === order._id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Cancel order"
                  )}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => downloadInvoice(order._id)}>
                <FileText className="mr-1 h-3.5 w-3.5" />
                Invoice
              </Button>
              {onRepeatOrder && (
                <Button variant="outline" size="sm" onClick={() => onRepeatOrder(order._id)}>
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                  Reorder
                </Button>
              )}
              {order.paymentStatus === "pending" &&
                order.status !== "cancelled" &&
                ["stripe", "paypal", "payhere"].includes(order.paymentMethod) && (
                  <Button variant="secondary" size="sm" onClick={() => payNow(order)}>
                    Pay now
                  </Button>
                )}
            </div>

            {canReturn && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                <Input
                  placeholder="Return reason…"
                  value={returnReason[order._id] ?? ""}
                  onChange={(e) =>
                    setReturnReason((prev) => ({ ...prev, [order._id]: e.target.value }))
                  }
                  className="min-w-[200px] flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={returningId === order._id}
                  onClick={() => void requestReturn(order._id)}
                >
                  {returningId === order._id ? <LoadingSpinner size="sm" /> : "Request return"}
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
