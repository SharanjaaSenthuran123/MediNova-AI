"use client";

import { Heart, History, Sparkles, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import type { WishlistItem, RecentlyViewedItem, Recommendation } from "@/hooks/usePharmacySmart";

interface SmartCartExtrasProps {
  wishlist: WishlistItem[];
  recentlyViewed: RecentlyViewedItem[];
  recommendations: Recommendation[];
  loading?: boolean;
  isWishlisted: (id: string) => boolean;
  onToggleWishlist: (medicineId: string, inWishlist: boolean) => void;
  onAddMedicine: (medicineId: string, name: string) => void;
  onRepeatOrder?: (orderId: string) => void;
  lastOrderId?: string;
}

export function SmartCartExtras({
  wishlist,
  recentlyViewed,
  recommendations,
  loading,
  isWishlisted,
  onToggleWishlist,
  onAddMedicine,
  onRepeatOrder,
  lastOrderId,
}: SmartCartExtrasProps) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lastOrderId && onRepeatOrder && (
        <Card className="glass flex items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-2 text-sm">
            <RotateCcw className="h-4 w-4 text-primary" />
            <span>Reorder your last purchase</span>
          </div>
          <Button size="sm" variant="secondary" onClick={() => onRepeatOrder(lastOrderId)}>
            Repeat order
          </Button>
        </Card>
      )}

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="glass p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Recommended
          </h4>
          {recommendations.length === 0 ? (
            <p className="text-xs text-muted">Browse medicines for personalized picks.</p>
          ) : (
            <ul className="space-y-1.5">
              {recommendations.slice(0, 4).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    className="truncate text-left hover:text-primary"
                    onClick={() => onAddMedicine(r.id, r.name)}
                  >
                    {r.name}
                  </button>
                  <Badge variant="outline">${r.price.toFixed(2)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="glass p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <History className="h-4 w-4 text-secondary" /> Recently viewed
          </h4>
          {recentlyViewed.length === 0 ? (
            <p className="text-xs text-muted">Your browsing history appears here.</p>
          ) : (
            <ul className="space-y-1.5">
              {recentlyViewed.slice(0, 4).map((r) => (
                <li key={r.medicineId} className="flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    className="truncate text-left hover:text-primary"
                    onClick={() => onAddMedicine(r.medicineId, r.medicineName)}
                  >
                    {r.medicineName}
                  </button>
                  <span className="text-muted">${r.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="glass p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Heart className="h-4 w-4 text-danger" /> Wishlist
          </h4>
          {wishlist.length === 0 ? (
            <p className="text-xs text-muted">Save medicines with the heart icon.</p>
          ) : (
            <ul className="space-y-1.5">
              {wishlist.slice(0, 4).map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    className="truncate text-left hover:text-primary"
                    onClick={() => onAddMedicine(w.medicineId, w.medicineName)}
                  >
                    {w.medicineName}
                  </button>
                  <button
                    type="button"
                    className="text-danger"
                    onClick={() => onToggleWishlist(w.medicineId, true)}
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
