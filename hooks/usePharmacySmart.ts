"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, apiPost, apiDelete } from "@/lib/api/client";
import type { PharmacySearchResult } from "@/types/pharmacy";

export interface WishlistItem {
  id: string;
  medicineId: string;
  medicineName: string;
  price: number;
}

export interface RecentlyViewedItem {
  medicineId: string;
  medicineName: string;
  price: number;
  category?: string;
  pharmacyName?: string;
}

export interface Recommendation {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  reason: string;
}

export function usePharmacySmart() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wl, rv, rec] = await Promise.all([
        apiFetch<{ items: WishlistItem[] }>("/api/pharmacy/smart/wishlist").catch(() => ({
          items: [],
        })),
        apiFetch<{ items: RecentlyViewedItem[] }>("/api/pharmacy/smart/recently-viewed").catch(
          () => ({ items: [] })
        ),
        apiFetch<{ recommendations: Recommendation[] }>(
          "/api/pharmacy/smart/recommendations"
        ).catch(() => ({ recommendations: [] })),
      ]);
      setWishlist(wl.items);
      setRecentlyViewed(rv.items);
      setRecommendations(rec.recommendations);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const trackView = useCallback(async (medicineId: string) => {
    try {
      await apiPost("/api/pharmacy/smart/recently-viewed", { medicineId });
      void load();
    } catch {
      /* guest or offline */
    }
  }, [load]);

  const toggleWishlist = useCallback(
    async (medicineId: string, inWishlist: boolean) => {
      try {
        if (inWishlist) {
          await apiDelete(`/api/pharmacy/smart/wishlist/${medicineId}`);
        } else {
          await apiPost("/api/pharmacy/smart/wishlist", { medicineId });
        }
        void load();
      } catch {
        /* ignore */
      }
    },
    [load]
  );

  const repeatOrder = useCallback(async (orderId: string) => {
    const data = await apiPost<{ cart: { items: unknown[] } }>(
      `/api/pharmacy/smart/repeat-order/${orderId}`,
      {}
    );
    return data.cart.items.length;
  }, []);

  const isWishlisted = useCallback(
    (medicineId: string) => wishlist.some((w) => w.medicineId === medicineId),
    [wishlist]
  );

  const fetchAIRecommend = useCallback(async (symptoms: string) => {
    return apiPost<{
      medicines: { name: string; reason: string; genericAlternative?: string }[];
      warnings: string[];
      disclaimer: string;
      availableInCatalog: { id: string; name: string; price: number; stock: number }[];
    }>("/api/pharmacy/smart/ai-recommend", { symptoms });
  }, []);

  const checkInteractions = useCallback(async (medicineNames: string[]) => {
    return apiPost<{ warnings: { pair: string; severity: string; message: string }[]; safe: boolean }>(
      "/api/pharmacy/smart/interactions",
      { medicineNames }
    );
  }, []);

  return {
    wishlist,
    recentlyViewed,
    recommendations,
    loading,
    load,
    trackView,
    toggleWishlist,
    isWishlisted,
    repeatOrder,
    fetchAIRecommend,
    checkInteractions,
  };
}

export type { PharmacySearchResult };
