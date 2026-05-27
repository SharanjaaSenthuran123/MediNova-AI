import { Router } from "express";
import { z } from "zod";
import { Pharmacy, PharmacyInventory, MedicineOrder } from "../models/Pharmacy.js";
import { MedicineCatalog } from "../models/Order.js";
import type { AuthRequest } from "../middleware/auth.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAIResponse, parseJsonFromAI } from "../services/ai.service.js";
import { emitBroadcast, emitToUser } from "../services/socket.service.js";
import { isDemoMode } from "../config/database.js";
import { ensurePharmacyBootstrap } from "../services/pharmacy-bootstrap.service.js";
import { expandMedicineSearchTerms } from "../data/pharmacy-catalog.js";
import { toInventoryResult, toPharmacyDto } from "../utils/pharmacy-dto.js";
import { rankByDistance } from "../services/location.service.js";
import { MAX_DELIVERY_RADIUS_KM } from "../services/eta.service.js";

const router = Router();

async function ensurePharmacyReady() {
  if (isDemoMode()) return false;
  await ensurePharmacyBootstrap();
  return true;
}

function buildSearchFilter(query: string) {
  const q = query.trim();
  if (!q) return {};

  const terms = expandMedicineSearchTerms(q);
  const patterns = terms.length > 0 ? terms : [q];

  return {
    $or: patterns.flatMap((term) => [
      { medicineName: { $regex: term, $options: "i" } },
      { genericName: { $regex: term, $options: "i" } },
    ]),
  };
}

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (_req, res) => {
    if (!(await ensurePharmacyReady())) {
      return res.json({ pharmacies: [], demoMode: true });
    }

    const pharmacies = await Pharmacy.find().sort({ name: 1 });
    return res.json({ pharmacies: pharmacies.map(toPharmacyDto) });
  })
);

router.get(
  "/nearby",
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!(await ensurePharmacyReady())) {
      return res.json({ pharmacies: [] });
    }

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    const pharmacies = await Pharmacy.find();
    const ranked = rankByDistance({ lat, lng }, pharmacies).filter(
      (entry) => entry.distanceKm <= MAX_DELIVERY_RADIUS_KM
    );

    const enriched = await Promise.all(
      ranked.map(async ({ item, distanceKm }) => {
        const availableMedicines = await MedicineCatalog.countDocuments({
          pharmacyId: item._id,
          stock: { $gt: 0 },
        });
        const medicines = await MedicineCatalog.find({
          pharmacyId: item._id,
          stock: { $gt: 0 },
        })
          .sort({ name: 1 })
          .limit(8)
          .select("name stock price");

        return {
          ...toPharmacyDto(item),
          distanceKm,
          availableMedicines,
          topMedicines: medicines.map((m) => ({
            id: m._id.toString(),
            name: m.name,
            stock: m.stock,
            price: m.price,
          })),
        };
      })
    );

    return res.json({ pharmacies: enriched, maxDeliveryRadiusKm: MAX_DELIVERY_RADIUS_KM });
  })
);

router.get(
  "/search",
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!(await ensurePharmacyReady())) {
      return res.json({ results: [], query: "", demoMode: true });
    }

    const q = String(req.query.q ?? "").trim();
    const emergency = req.query.emergency === "true";
    const browse = req.query.browse === "true" || !q;

    const filter = browse ? {} : buildSearchFilter(q);

    const inventory = await PharmacyInventory.find(filter)
      .populate("pharmacyId")
      .sort({ medicineName: 1 })
      .limit(browse ? 60 : 100);

    let results = inventory.map(toInventoryResult);

    if (emergency) {
      results = results.filter(
        (r) => r.inStock && r.pharmacy?.isEmergency
      );
    }

    return res.json({ results, query: q, browse });
  })
);

router.get(
  "/orders/mine",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const orders = await MedicineOrder.find({ userId: req.user!._id })
      .populate("pharmacyId")
      .sort({ createdAt: -1 });

    return res.json({
      orders: orders.map((o) => ({
        _id: o._id.toString(),
        items: o.items,
        totalAmount: o.totalAmount,
        status: o.status,
        pharmacyId:
          o.pharmacyId && typeof o.pharmacyId === "object" && "name" in o.pharmacyId
            ? toPharmacyDto(o.pharmacyId as Parameters<typeof toPharmacyDto>[0])
            : o.pharmacyId,
        createdAt: (o as { createdAt?: Date }).createdAt,
      })),
    });
  })
);

router.get(
  "/:pharmacyId/inventory",
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!(await ensurePharmacyReady())) {
      return res.json({ inventory: [] });
    }

    const inventory = await PharmacyInventory.find({
      pharmacyId: req.params.pharmacyId,
    })
      .populate("pharmacyId")
      .sort({ medicineName: 1 });

    const catalog = await MedicineCatalog.find({ pharmacyId: req.params.pharmacyId });
    const catalogByName = new Map(
      catalog.map((entry) => [entry.name.toLowerCase(), entry._id.toString()])
    );

    return res.json({
      inventory: inventory.map((item) => ({
        ...toInventoryResult(item),
        catalogId: catalogByName.get(item.medicineName.toLowerCase()) ?? null,
      })),
    });
  })
);

router.patch(
  "/inventory/:id/stock",
  requireAuth,
  requireRole("admin", "doctor"),
  asyncHandler(async (req: AuthRequest, res) => {
    if (!(await ensurePharmacyReady())) {
      return res.status(503).json({ error: "Requires MongoDB." });
    }

    const stock = Number(req.body.stock);
    if (Number.isNaN(stock) || stock < 0) {
      return res.status(400).json({ error: "Invalid stock value" });
    }

    const item = await PharmacyInventory.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    ).populate("pharmacyId");

    if (!item) return res.status(404).json({ error: "Inventory item not found" });

    await MedicineCatalog.findOneAndUpdate(
      { pharmacyId: item.pharmacyId, name: item.medicineName },
      { stock }
    );

    emitBroadcast("pharmacy:stock", {
      inventoryId: item._id.toString(),
      medicineName: item.medicineName,
      stock: item.stock,
      pharmacyId: String(item.pharmacyId),
    });

    return res.json({ item: toInventoryResult(item) });
  })
);

router.post(
  "/compare",
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!(await ensurePharmacyReady())) {
      return res.json({ comparisons: [] });
    }

    const medicineName = String(req.body.medicineName ?? "").trim();
    if (!medicineName) return res.status(400).json({ error: "Medicine name required" });

    const filter = buildSearchFilter(medicineName);
    const items = await PharmacyInventory.find(filter).populate("pharmacyId");

    const comparisons = items
      .map((item) => ({
        ...toInventoryResult(item),
        pharmacy: toInventoryResult(item).pharmacy,
      }))
      .sort((a, b) => a.price - b.price);

    return res.json({ comparisons });
  })
);

router.post(
  "/ai-recommend",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const symptoms = String(req.body.symptoms ?? "");
    const ai = await generateAIResponse(
      'Return JSON: {"medicines":[{"name":"...","reason":"...","genericAlternative":"..."}],"disclaimer":"..."}',
      `Recommend OTC medicines for symptoms: ${symptoms}. Include generic alternatives.`
    );
    const result = parseJsonFromAI(ai.content, { medicines: [], disclaimer: "" });
    return res.json({ ...result, source: ai.source });
  })
);

router.post(
  "/alternatives",
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!(await ensurePharmacyReady())) {
      return res.json({ alternatives: [] });
    }

    const medicineName = String(req.body.medicineName ?? "");
    const filter = buildSearchFilter(medicineName);
    const item = await PharmacyInventory.findOne(filter);

    const alternatives = item?.genericName
      ? await PharmacyInventory.find({
          genericName: { $regex: item.genericName, $options: "i" },
          _id: { $ne: item._id },
        }).populate("pharmacyId")
      : [];

    return res.json({
      alternatives: alternatives.map(toInventoryResult),
      original: item ? toInventoryResult(item) : null,
    });
  })
);

router.post(
  "/orders",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      pharmacyId: z.string(),
      items: z.array(
        z.object({
          medicineName: z.string(),
          quantity: z.number().min(1),
          price: z.number(),
        })
      ),
      prescriptionUrl: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid order" });

    const totalAmount = parsed.data.items.reduce(
      (s, i) => s + i.price * i.quantity,
      0
    );

    const order = await MedicineOrder.create({
      userId: req.user!._id,
      pharmacyId: parsed.data.pharmacyId,
      items: parsed.data.items,
      totalAmount,
      prescriptionUrl: parsed.data.prescriptionUrl,
      status: "pending",
    });

    emitToUser(req.user!._id.toString(), "notification", {
      title: "Medicine order placed",
      body: `Order total: $${totalAmount.toFixed(2)}`,
    });

    return res.json({ order });
  })
);

router.post(
  "/prescriptions",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const rawText = String(req.body.rawText ?? "");
    const medicines = req.body.medicines ?? [];

    const { Prescription } = await import("../models/Clinical.js");
    const prescription = await Prescription.create({
      userId: req.user!._id,
      medicines: Array.isArray(medicines) ? medicines : [],
      rawTextPreview: rawText.slice(0, 500),
      source: "upload",
    });

    return res.json({ prescription });
  })
);

export default router;
