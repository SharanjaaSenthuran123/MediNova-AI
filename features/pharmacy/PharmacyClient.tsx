"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Search,
  Pill,
  AlertTriangle,
  Clock,
  ShoppingBag,
  ShoppingCart,
  ExternalLink,
  Package,
  Crosshair,
  ClipboardList,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, apiPost, ApiError } from "@/lib/api/client";
import { setCurrentLocation, resolveDeliveryLocation, persistUserLocation, LocationError, getLocationHelpText, getLocationQualityWarning, isApproximateLocation, type GeoLocation } from "@/lib/geolocation";
import { getSocket } from "@/components/providers/SocketProvider";
import { usePharmacyCart } from "@/hooks/usePharmacyCart";
import { usePharmacySmart } from "@/hooks/usePharmacySmart";
import { FeaturePageShell } from "@/components/layout/FeaturePageShell";
import { DeliveryLocationPicker } from "@/features/pharmacy/DeliveryLocationPicker";
import { PharmacyCheckout } from "@/features/pharmacy/PharmacyCheckout";
import { OrderTrackingPanel } from "@/features/pharmacy/OrderTrackingPanel";
import { SmartCartExtras } from "@/features/pharmacy/SmartCartExtras";
import { PharmacyAIRecommendations } from "@/features/pharmacy/PharmacyAIRecommendations";
import { SavedAddressesPanel } from "@/features/pharmacy/SavedAddressesPanel";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceKm, haversineKm } from "@/lib/distance";
import type {
  DeliveryOrder,
  PaymentMethod,
  Pharmacy,
  PharmacySearchResult,
} from "@/types/pharmacy";
import { orderStatusLabel } from "@/types/pharmacy";

type TabId = "shop" | "cart" | "orders";

export function PharmacyClient() {
  const cart = usePharmacyCart();
  const smart = usePharmacySmart();
  const [tab, setTab] = useState<TabId>("shop");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [osmPharmacies, setOsmPharmacies] = useState<
    { id: string; name: string; address: string; distanceKm: number; lat: number; lng: number }[]
  >([]);
  const [results, setResults] = useState<PharmacySearchResult[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [pharmacyInventory, setPharmacyInventory] = useState<PharmacySearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [liveStock, setLiveStock] = useState<Record<string, number>>({});
  const [searched, setSearched] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<GeoLocation | null>(null);
  const [locating, setLocating] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [orderNotes, setOrderNotes] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  const loadNearbyPharmacies = useCallback(async (geo: GeoLocation) => {
    try {
      const res = await apiFetch<{ pharmacies: Pharmacy[] }>(
        `/api/pharmacy/nearby?lat=${encodeURIComponent(geo.lat)}&lng=${encodeURIComponent(geo.lng)}`
      );
      setPharmacies(res.pharmacies ?? []);
    } catch {
      try {
        const res = await apiFetch<{ pharmacies: Pharmacy[] }>("/api/pharmacy");
        setPharmacies(res.pharmacies ?? []);
      } catch {
        setPharmacies([]);
      }
    }

    try {
      const osmRes = await fetch(
        `/api/nearby?lat=${encodeURIComponent(geo.lat)}&lng=${encodeURIComponent(geo.lng)}&type=pharmacy`,
        { cache: "no-store" }
      );
      const osmData = (await osmRes.json()) as {
        places?: { id: string; name: string; address: string; distanceKm: number; lat: number; lng: number }[];
      };
      setOsmPharmacies(osmData.places ?? []);
    } catch {
      setOsmPharmacies([]);
    }
  }, []);

  const applyCurrentLocation = useCallback(async (quiet = false) => {
    setLocating(true);
    try {
      const geo = await setCurrentLocation();
      setDeliveryLocation(geo);
      await loadNearbyPharmacies(geo);
      if (!quiet) {
        if (isApproximateLocation(geo)) {
          toast.warning("Approximate location only", {
            description:
              getLocationQualityWarning(geo) ??
              "Drag the pin on the map to your exact delivery address.",
          });
        } else {
          toast.success("Current location set", {
            description: geo.address?.slice(0, 80) ?? `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}`,
          });
        }
      }
    } catch (err) {
      const fallback = await resolveDeliveryLocation();
      setDeliveryLocation(fallback);
      await loadNearbyPharmacies(fallback);
      if (!quiet) {
        const code = err instanceof LocationError ? err.code : undefined;
        toast.error("Could not get GPS", {
          description: getLocationHelpText(code),
        });
      }
    } finally {
      setLocating(false);
    }
  }, [loadNearbyPharmacies]);

  useEffect(() => {
    void (async () => {
      setLocating(true);
      const geo = await resolveDeliveryLocation();
      setDeliveryLocation(geo);
      await loadNearbyPharmacies(geo);
      setLocating(false);
    })();
  }, [loadNearbyPharmacies]);

  useEffect(() => {
    if (deliveryLocation) {
      void loadNearbyPharmacies(deliveryLocation);
    }
  }, [deliveryLocation?.lat, deliveryLocation?.lng, loadNearbyPharmacies]);

  const handleLocationChange = useCallback((location: GeoLocation) => {
    setDeliveryLocation(location);
    void persistUserLocation(location);
    void loadNearbyPharmacies(location);
  }, [loadNearbyPharmacies]);

  const loadPharmacies = useCallback(async () => {
    const res = await apiFetch<{ pharmacies: Pharmacy[] }>("/api/pharmacy");
    setPharmacies(res.pharmacies);
    return res.pharmacies;
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await apiFetch<{ orders: DeliveryOrder[] }>(
        "/api/orders/medicines/orders/mine"
      );
      setOrders(res.orders);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const mapMedicines = (medicines: {
    id: string;
    catalogId?: string;
    name: string;
    genericName?: string;
    stock: number;
    price: number;
    expiryDate: string;
    requiresPrescription: boolean;
    category: string;
    inStock: boolean;
    pharmacy: Pharmacy | null;
  }[]): PharmacySearchResult[] =>
    medicines.map((m) => ({
      id: m.id,
      catalogId: m.catalogId ?? m.id,
      medicineName: m.name,
      genericName: m.genericName,
      stock: m.stock,
      price: m.price,
      unit: "tablet",
      expiryDate: m.expiryDate,
      requiresPrescription: m.requiresPrescription,
      category: m.category,
      pharmacy: m.pharmacy,
      pharmacyId:
        (m.pharmacy as { _id?: string; id?: string } | null)?._id ??
        (m.pharmacy as { id?: string } | null)?.id,
      inStock: m.inStock,
    }));

  const fetchMedicines = async (params: URLSearchParams) => {
    const res = await apiFetch<{ medicines: Parameters<typeof mapMedicines>[0] }>(
      `/api/orders/medicines?${params}`
    );
    return mapMedicines(res.medicines);
  };

  const browseMedicines = useCallback(async () => {
    const params = new URLSearchParams();
    if (showAvailableOnly || emergencyMode) params.set("inStock", "true");
    setResults(await fetchMedicines(params));
  }, [emergencyMode, showAvailableOnly]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadPharmacies(), loadOrders(), browseMedicines()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load pharmacies");
    } finally {
      setLoading(false);
    }
  }, [loadPharmacies, loadOrders, browseMedicines]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!loading) void browseMedicines();
  }, [showAvailableOnly, emergencyMode, loading, browseMedicines]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    if (!socket.connected) socket.connect();

    const onStock = (payload: { inventoryId: string; stock: number }) => {
      setLiveStock((prev) => ({ ...prev, [payload.inventoryId]: payload.stock }));
      setResults((prev) =>
        prev.map((r) =>
          r.id === payload.inventoryId || r.catalogId === payload.inventoryId
            ? { ...r, stock: payload.stock, inStock: payload.stock > 0 }
            : r
        )
      );
    };

    const onOrderUpdated = (payload: { orderId: string; status: string }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === payload.orderId ? { ...o, status: payload.status as DeliveryOrder["status"] } : o
        )
      );
      toast.info("Order updated", { description: `Status: ${payload.status}` });
    };

    socket.on("pharmacy:stock", onStock);
    socket.on("order:updated", onOrderUpdated);
    return () => {
      socket.off("pharmacy:stock", onStock);
      socket.off("order:updated", onOrderUpdated);
    };
  }, []);

  const search = async () => {
    setSearching(true);
    setSearched(true);
    setSelectedPharmacy(null);
    setPharmacyInventory([]);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (showAvailableOnly || emergencyMode) params.set("inStock", "true");
      const mapped = query.trim()
        ? await fetchMedicines(params)
        : await fetchMedicines(
            new URLSearchParams(showAvailableOnly || emergencyMode ? { inStock: "true" } : {})
          );
      setResults(mapped);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const openPharmacy = async (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setInventoryLoading(true);
    try {
      const res = await apiFetch<{ inventory: PharmacySearchResult[] }>(
        `/api/pharmacy/${pharmacy._id}/inventory`
      );
      setPharmacyInventory(res.inventory);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load inventory");
      setPharmacyInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  const addToCart = (item: PharmacySearchResult) => {
    const stock = getStock(item.id, item.stock);
    const result = cart.addItem({ ...item, stock });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    void smart.trackView(item.catalogId ?? item.id);
    toast.success("Added to cart", { description: item.medicineName });
  };

  const orderNow = async (item: PharmacySearchResult) => {
    const stock = getStock(item.id, item.stock);
    if (stock <= 0) {
      toast.error("This medicine is out of stock");
      return;
    }

    const medicineId = item.catalogId ?? item.id;
    const alreadyInCart = cart.items.some((line) => line.medicineId === medicineId);
    if (!alreadyInCart) {
      const result = cart.addItem({ ...item, stock });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
    }

    void smart.trackView(medicineId);

    if (!deliveryLocation) {
      try {
        const geo = await resolveDeliveryLocation();
        setDeliveryLocation(geo);
      } catch {
        toast.error("Set your delivery location before ordering");
        return;
      }
    }

    setTab("cart");
    toast.success("Proceed to checkout", { description: item.medicineName });
  };

  const handleRepeatOrder = async (orderId: string) => {
    try {
      const count = await smart.repeatOrder(orderId);
      if (count > 0) {
        await cart.reloadCart();
        toast.success("Items added to cart from previous order");
        setTab("cart");
      } else {
        toast.error("No items available to reorder");
      }
    } catch {
      toast.error("Sign in to repeat orders");
    }
  };

  const checkout = async () => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    let location = deliveryLocation;
    if (!location) {
      location = await resolveDeliveryLocation();
      setDeliveryLocation(location);
    }

    setCheckingOut(true);
    try {
      await persistUserLocation(location);

      const res = await apiPost<{ order: DeliveryOrder }>("/api/orders/create", {
        items: cart.items.map((line) => ({
          medicineId: line.medicineId,
          quantity: line.quantity,
        })),
        lat: location.lat,
        lng: location.lng,
        deliveryAddress: location.address ?? location.label,
        isEmergency: emergencyMode,
        paymentMethod,
        notes: orderNotes || undefined,
      });
      cart.clearCart();
      setOrderNotes("");
      setTab("orders");
      toast.success("Order confirmed!", {
        description: `Order #${res.order._id.slice(-6).toUpperCase()} — $${res.order.totalAmount.toFixed(2)} · ${orderStatusLabel(res.order.status)}`,
      });
      void loadOrders();
      void browseMedicines();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Please sign in to place an order", {
          description: "Use patient@medinova.ai / demo123 on the login page.",
        });
      } else {
        toast.error(err instanceof Error ? err.message : "Checkout failed");
      }
    } finally {
      setCheckingOut(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      const res = await apiPost<{ order: DeliveryOrder }>(
        `/api/orders/medicines/orders/${orderId}/cancel`,
        {}
      );
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.order : o)));
      toast.success("Order cancelled");
      void browseMedicines();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setCancellingId(null);
    }
  };

  const getStock = (id: string, defaultStock: number) => liveStock[id] ?? defaultStock;
  const mapsUrl = (pharmacy: Pharmacy) =>
    `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`;

  const renderMedicineCard = (item: PharmacySearchResult, i: number) => {
    const stock = getStock(item.id, item.stock);
    const pharmacy = item.pharmacy;
    const inCart = cart.items.find(
      (line) => line.medicineId === (item.catalogId ?? item.id)
    );

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03 }}
      >
        <Card className="glass h-full">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{item.medicineName}</CardTitle>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded p-1 text-muted hover:text-danger"
                  onClick={() =>
                    void smart.toggleWishlist(
                      item.catalogId ?? item.id,
                      smart.isWishlisted(item.catalogId ?? item.id)
                    )
                  }
                  aria-label="Wishlist"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      smart.isWishlisted(item.catalogId ?? item.id) && "fill-danger text-danger"
                    )}
                  />
                </button>
                <Badge variant={stock > 0 ? "success" : "danger"}>
                  {stock > 0 ? `${stock} in stock` : "Out of stock"}
                </Badge>
              </div>
            </div>
            {item.genericName && (
              <p className="text-xs text-muted">Generic: {item.genericName}</p>
            )}
          </CardHeader>
          <div className="space-y-2 px-6 pb-4 text-sm">
            <p className="font-semibold text-primary">
              ${item.price.toFixed(2)}/{item.unit}
            </p>
            {item.requiresPrescription && (
              <Badge variant="warning">Prescription required</Badge>
            )}
            {pharmacy && (
              <>
                <p className="font-medium">{pharmacy.name}</p>
                <p className="flex items-center gap-1 text-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {pharmacy.address}, {pharmacy.city}
                  {deliveryLocation && (
                    <span className="text-primary">
                      · {formatDistanceKm(
                        haversineKm(
                          deliveryLocation.lat,
                          deliveryLocation.lng,
                          pharmacy.lat,
                          pharmacy.lng
                        )
                      )}
                    </span>
                  )}
                </p>
              </>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {stock > 0 && (
                <>
                  <Button size="sm" onClick={() => addToCart(item)}>
                    <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                    {inCart ? `In cart (${inCart.quantity})` : "Add to cart"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void orderNow(item)}>
                    <ClipboardList className="mr-1 h-3.5 w-3.5" />
                    Order now
                  </Button>
                </>
              )}
              {pharmacy?.phone && (
                <a href={`tel:${pharmacy.phone}`}>
                  <Button variant="outline" size="sm">
                    <Phone className="mr-1 h-3.5 w-3.5" />
                    Call
                  </Button>
                </a>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const tabs: { id: TabId; label: string; icon: typeof Pill; badge?: number }[] = [
    { id: "shop", label: "Shop", icon: Pill },
    { id: "cart", label: "Cart", icon: ShoppingCart, badge: cart.itemCount },
    { id: "orders", label: "My Orders", icon: ClipboardList, badge: orders.filter((o) => o.status === "pending").length || undefined },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <FeaturePageShell
      title="Online Pharmacy Orders"
      description="Browse medicines, add to cart, set delivery location, checkout, and track orders live."
      eyebrow="Pharmacy"
      disclaimerVariant="warning"
      disclaimer="Verify medicine availability and prescriptions with a licensed pharmacist before purchase."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <Button
            key={id}
            variant={tab === id ? "primary" : "outline"}
            onClick={() => setTab(id)}
            className="relative"
          >
            <Icon className="mr-1.5 h-4 w-4" />
            {label}
            {badge ? (
              <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 text-xs font-bold">
                {badge}
              </span>
            ) : null}
          </Button>
        ))}
      </div>

      <Card className="glass mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            Delivery location
          </p>
          {locating ? (
            <p className="mt-1 flex items-center gap-2 text-xs text-muted">
              <LoadingSpinner size="sm" />
              Getting your current location…
            </p>
          ) : deliveryLocation ? (
            <p className="mt-1 truncate text-xs text-muted">
              {deliveryLocation.address ?? deliveryLocation.label}
              {deliveryLocation.source === "gps" ? " · GPS" : ""}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted">Location not set</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyCurrentLocation()}
          disabled={locating}
        >
          <Crosshair className="mr-1.5 h-4 w-4" />
          Set current location
        </Button>
      </Card>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SavedAddressesPanel
          currentLocation={deliveryLocation}
          onSelect={handleLocationChange}
        />
        <PharmacyAIRecommendations
          onRecommend={smart.fetchAIRecommend}
          onCheckInteractions={smart.checkInteractions}
          cartMedicineNames={cart.items.map((l) => l.medicineName)}
          onAddCatalogId={(id, name) => {
            const match = results.find((r) => (r.catalogId ?? r.id) === id);
            if (match) addToCart(match);
            else toast.message(`Search for ${name} to add to cart`);
          }}
        />
      </div>

      <SmartCartExtras
        wishlist={smart.wishlist}
        recentlyViewed={smart.recentlyViewed}
        recommendations={smart.recommendations}
        loading={smart.loading}
        isWishlisted={smart.isWishlisted}
        onToggleWishlist={smart.toggleWishlist}
        onAddMedicine={(id, name) => {
          const match = results.find((r) => (r.catalogId ?? r.id) === id);
          if (match) addToCart(match);
          else toast.message(`Search for ${name}`);
        }}
        onRepeatOrder={handleRepeatOrder}
        lastOrderId={orders[0]?._id}
      />

      {tab === "shop" && (
        <>
          <AnimatePresence>
            {emergencyMode && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-danger"
              >
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">Emergency mode — in-stock medicines only</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="glass mb-6 p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  placeholder="Search Paracetamol, Panadol, Metformin..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  className="pl-10"
                />
              </div>
              <Button onClick={search} disabled={searching}>
                {searching ? <LoadingSpinner size="sm" /> : "Search"}
              </Button>
              <Button
                variant={emergencyMode ? "danger" : "outline"}
                onClick={() => setEmergencyMode(!emergencyMode)}
              >
                <AlertTriangle className="mr-1.5 h-4 w-4" />
                Emergency
              </Button>
              {cart.itemCount > 0 && (
                <Button variant="secondary" onClick={() => setTab("cart")}>
                  <ShoppingBag className="mr-1.5 h-4 w-4" />
                  Checkout ({cart.itemCount})
                </Button>
              )}
            </div>
          </Card>

          <div className="mb-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5 text-primary" />
                {searched && query.trim() ? `Results for "${query}"` : "Available Medicines"}
                <Badge variant="secondary">{results.length}</Badge>
              </h3>
              <Button
                variant={showAvailableOnly ? "primary" : "outline"}
                size="sm"
                onClick={() => setShowAvailableOnly((v) => !v)}
              >
                {showAvailableOnly ? "In stock only" : "Show all"}
              </Button>
            </div>
            {results.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((item, i) => renderMedicineCard(item, i))}
              </div>
            ) : (
              <Card className="glass p-8 text-center text-muted">
                <Pill className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No medicines in stock nearby. Try turning off &quot;In stock only&quot; or search another name.</p>
              </Card>
            )}
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-primary" />
              Nearby Pharmacies
              {deliveryLocation && (
                <span className="text-sm font-normal text-muted">
                  · sorted by distance from you
                </span>
              )}
            </h3>
            <div className="grid gap-3 lg:grid-cols-2">
              {pharmacies.map((p, i) => (
                <Card
                  key={p._id}
                  className={cn(
                    "glass cursor-pointer transition-all hover:ring-2 hover:ring-primary/30",
                    selectedPharmacy?._id === p._id && "ring-2 ring-primary",
                    i === 0 && p.distanceKm != null && "border-primary/40"
                  )}
                  onClick={() => openPharmacy(p)}
                >
                  <div className="flex items-start justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{p.name}</p>
                        {i === 0 && p.distanceKm != null && (
                          <Badge variant="success">Nearest</Badge>
                        )}
                        {p.is24Hours && <Badge variant="outline">24/7</Badge>}
                      </div>
                      <p className="text-sm text-muted">
                        {p.address}, {p.city}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                        {p.distanceKm != null && (
                          <span className="font-medium text-primary">
                            {formatDistanceKm(p.distanceKm)} away
                          </span>
                        )}
                        {p.availableMedicines != null && (
                          <span>{p.availableMedicines} medicines in stock</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {p.openHours} · ★ {p.rating}
                        </span>
                      </div>
                      {p.topMedicines && p.topMedicines.length > 0 && (
                        <p className="mt-2 truncate text-xs text-muted">
                          In stock: {p.topMedicines.map((m) => m.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <a
                      href={mapsUrl(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>

            {pharmacies.length === 0 && (
              <Card className="glass mb-4 p-6 text-center text-muted">
                <p>No partner pharmacies loaded. Set your location or refresh the page.</p>
              </Card>
            )}

            {osmPharmacies.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-semibold text-muted">
                  More pharmacies on OpenStreetMap near you
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {osmPharmacies.slice(0, 6).map((p) => (
                    <a
                      key={p.id}
                      href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=17/${p.lat}/${p.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-border/60 bg-white/30 px-3 py-2 text-sm transition-colors hover:bg-primary/5 dark:bg-white/5"
                    >
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted">
                        {formatDistanceKm(p.distanceKm)} · {p.address}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedPharmacy && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium">{selectedPharmacy.name} — Stock</h4>
                {inventoryLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <div className="space-y-2">
                    {pharmacyInventory.map((item) => {
                      const stock = getStock(item.id, item.stock);
                      return (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
                        >
                          <span>{item.medicineName}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={stock > 0 ? "success" : "danger"}>
                              {stock} · ${item.price.toFixed(2)}
                            </Badge>
                            {stock > 0 && (
                              <>
                                <Button size="sm" onClick={() => addToCart(item)}>
                                  <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                                  Add
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => void orderNow(item)}>
                                  <ClipboardList className="mr-1 h-3.5 w-3.5" />
                                  Order
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "cart" && (
        deliveryLocation ? (
        <PharmacyCheckout
          items={cart.items}
          subtotal={cart.subtotal}
          deliveryLocation={deliveryLocation}
          onLocationChange={handleLocationChange}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          notes={orderNotes}
          onNotesChange={setOrderNotes}
          onSetQuantity={cart.setQuantity}
          onRemove={cart.removeItem}
          onCheckout={checkout}
          checkingOut={checkingOut}
          isEmergency={emergencyMode}
        />
        ) : (
          <Card className="glass p-8 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-3 text-sm text-muted">Loading delivery location…</p>
          </Card>
        )
      )}

      {tab === "orders" && (
        <OrderTrackingPanel
          orders={orders}
          loading={ordersLoading}
          onRefresh={loadOrders}
          onCancel={cancelOrder}
          onRepeatOrder={handleRepeatOrder}
          cancellingId={cancellingId}
        />
      )}
    </FeaturePageShell>
  );
}
