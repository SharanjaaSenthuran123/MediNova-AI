"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, apiPost } from "@/lib/api/client";
import type { CartItem, PharmacySearchResult } from "@/types/pharmacy";

const STORAGE_KEY = "medinova_pharmacy_cart";

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function medicineId(item: PharmacySearchResult) {
  return item.catalogId ?? item.id;
}

type CartDto = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

async function fetchServerCart(): Promise<CartItem[] | null> {
  try {
    const data = await apiFetch<{ cart: CartDto }>("/api/cart");
    return data.cart.items ?? [];
  } catch {
    return null;
  }
}

export function usePharmacyCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void (async () => {
      const serverItems = await fetchServerCart();
      if (serverItems && serverItems.length > 0) {
        setItems(serverItems);
      } else {
        setItems(readStoredCart());
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    const onFocus = () => {
      void fetchServerCart().then((serverItems) => {
        if (serverItems) setItems(serverItems);
      });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const syncAdd = useCallback(async (id: string, quantity: number) => {
    try {
      const data = await apiPost<{ cart: CartDto }>("/api/cart/add", {
        medicineId: id,
        quantity,
      });
      setItems(data.cart.items);
      return true;
    } catch {
      return false;
    }
  }, []);

  const syncUpdate = useCallback(async (id: string, quantity: number) => {
    try {
      const data = await apiFetch<{ cart: CartDto }>("/api/cart/update", {
        method: "PUT",
        body: JSON.stringify({ medicineId: id, quantity }),
      });
      setItems(data.cart.items);
      return true;
    } catch {
      return false;
    }
  }, []);

  const syncRemove = useCallback(async (id: string) => {
    try {
      const data = await apiFetch<{ cart: CartDto }>("/api/cart/remove", {
        method: "DELETE",
        body: JSON.stringify({ medicineId: id }),
      });
      setItems(data.cart.items);
      return true;
    } catch {
      return false;
    }
  }, []);

  const addItem = useCallback(
    (product: PharmacySearchResult, quantity = 1) => {
      const id = medicineId(product);
      if (!id) {
        return { ok: false as const, error: "Medicine unavailable for online order" };
      }
      if (!product.catalogId && product.id !== id) {
        return {
          ok: false as const,
          error: "This medicine is not linked to the online catalog. Browse the Shop tab instead.",
        };
      }

      const pharmacyId = product.pharmacyId ?? product.pharmacy?._id;
      const existing = items.find((line) => line.medicineId === id);
      const nextQty = (existing?.quantity ?? 0) + quantity;

      if (
        items.length > 0 &&
        pharmacyId &&
        items[0].pharmacyId &&
        items[0].pharmacyId !== pharmacyId
      ) {
        return {
          ok: false as const,
          error: "Cart supports one pharmacy per order. Checkout or clear cart first.",
        };
      }

      if (nextQty > product.stock) {
        return { ok: false as const, error: `Only ${product.stock} in stock` };
      }

      void syncAdd(id, quantity);

      setItems((prev) => {
        const line = prev.find((entry) => entry.medicineId === id);
        if (line) {
          return prev.map((entry) =>
            entry.medicineId === id
              ? { ...entry, quantity: nextQty, maxStock: product.stock }
              : entry
          );
        }
        return [
          ...prev,
          {
            medicineId: id,
            medicineName: product.medicineName,
            price: product.price,
            quantity,
            unit: product.unit,
            maxStock: product.stock,
            pharmacyId,
            pharmacyName: product.pharmacy?.name,
            requiresPrescription: product.requiresPrescription,
          },
        ];
      });

      return { ok: true as const };
    },
    [items, syncAdd]
  );

  const setQuantity = useCallback(
    (targetId: string, quantity: number) => {
      void syncUpdate(targetId, quantity);
      setItems((prev) =>
        prev
          .map((line) =>
            line.medicineId === targetId
              ? { ...line, quantity: Math.min(Math.max(1, quantity), line.maxStock) }
              : line
          )
          .filter((line) => line.quantity > 0)
      );
    },
    [syncUpdate]
  );

  const removeItem = useCallback(
    (targetId: string) => {
      void syncRemove(targetId);
      setItems((prev) => prev.filter((line) => line.medicineId !== targetId));
    },
    [syncRemove]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    void apiFetch("/api/cart", { method: "DELETE" }).catch(() => undefined);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const reloadCart = useCallback(async () => {
    const serverItems = await fetchServerCart();
    if (serverItems) setItems(serverItems);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [items]
  );

  return {
    items,
    itemCount,
    subtotal,
    hydrated,
    addItem,
    setQuantity,
    removeItem,
    clearCart,
    reloadCart,
  };
}
