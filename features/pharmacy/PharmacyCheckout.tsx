"use client";

import { Minus, Plus, ShoppingCart, Trash2, Truck } from "lucide-react";
import type { GeoLocation } from "@/lib/geolocation";
import type { CartItem, PaymentMethod } from "@/types/pharmacy";
import { DeliveryLocationPicker } from "@/features/pharmacy/DeliveryLocationPicker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";

const DELIVERY_FEE = 2.99;

interface PharmacyCheckoutProps {
  items: CartItem[];
  subtotal: number;
  deliveryLocation: GeoLocation;
  onLocationChange: (location: GeoLocation) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSetQuantity: (medicineId: string, quantity: number) => void;
  onRemove: (medicineId: string) => void;
  onCheckout: () => void;
  checkingOut: boolean;
  isEmergency: boolean;
}

export function PharmacyCheckout({
  items,
  subtotal,
  deliveryLocation,
  onLocationChange,
  paymentMethod,
  onPaymentMethodChange,
  notes,
  onNotesChange,
  onSetQuantity,
  onRemove,
  onCheckout,
  checkingOut,
  isEmergency,
}: PharmacyCheckoutProps) {
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0);

  if (items.length === 0) {
    return (
      <Card className="glass p-10 text-center text-muted">
        <ShoppingCart className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p className="font-medium text-foreground">Your cart is empty</p>
        <p className="mt-1 text-sm">Browse medicines and tap Add to Cart.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h3>
        {items.map((item) => (
          <Card key={item.medicineId} className="glass p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.medicineName}</p>
                <p className="text-sm text-muted">
                  ${item.price.toFixed(2)}/{item.unit}
                  {item.pharmacyName ? ` · ${item.pharmacyName}` : ""}
                </p>
                {item.requiresPrescription && (
                  <Badge variant="warning" className="mt-1 text-[10px]">
                    Prescription required
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onSetQuantity(item.medicineId, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onSetQuantity(item.medicineId, item.quantity + 1)}
                  disabled={item.quantity >= item.maxStock}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(item.medicineId)}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-right text-sm font-semibold text-primary">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </Card>
        ))}
      </div>

      <div className="space-y-4 lg:col-span-2">
        <Card className="glass p-4">
          <h3 className="mb-3 font-semibold">Checkout</h3>
          <DeliveryLocationPicker value={deliveryLocation} onChange={onLocationChange} />
          <div className="mt-4 space-y-3">
            <Select
              label="Payment method"
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
            >
              <option value="cod">Cash on delivery</option>
              <option value="card">Card (pay on delivery)</option>
              <option value="stripe">Stripe (online)</option>
              <option value="paypal">PayPal (online)</option>
              <option value="payhere">PayHere (online)</option>
              <option value="bank_transfer">Bank transfer</option>
            </Select>
            <Input
              label="Delivery notes (optional)"
              placeholder="Gate code, apartment, etc."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </Card>

        <Card className="glass p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Delivery</span>
              <span>${DELIVERY_FEE.toFixed(2)}</span>
            </div>
            {isEmergency && (
              <div className="flex justify-between text-danger">
                <span>Priority</span>
                <span>Emergency</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/60 pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={onCheckout} disabled={checkingOut}>
            {checkingOut ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Truck className="mr-2 h-4 w-4" />
                Place order · ${total.toFixed(2)}
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}

export { DELIVERY_FEE };
