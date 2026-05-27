import { Router } from "express";
import { z } from "zod";
import { Wishlist, RecentlyViewed } from "../models/PharmacyExtras.js";
import { MedicineCatalog, DeliveryOrder } from "../models/Order.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAIResponse, parseJsonFromAI } from "../services/ai.service.js";
import { expandMedicineSearchTerms } from "../data/pharmacy-catalog.js";

const router = Router();

router.get(
  "/wishlist",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const items = await Wishlist.find({ userId: req.user!._id }).sort({ updatedAt: -1 });
    return res.json({
      items: items.map((item) => ({
        id: item._id.toString(),
        medicineId: item.medicineId.toString(),
        medicineName: item.medicineName,
        price: item.price,
        pharmacyId: item.pharmacyId?.toString(),
        pharmacyName: item.pharmacyName,
      })),
    });
  })
);

router.post(
  "/wishlist",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({ medicineId: z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "medicineId required" });

    const med = await MedicineCatalog.findById(parsed.data.medicineId).populate("pharmacyId");
    if (!med) return res.status(404).json({ error: "Medicine not found" });

    const pharmacyName =
      med.pharmacyId && typeof med.pharmacyId === "object" && "name" in med.pharmacyId
        ? (med.pharmacyId as { name: string }).name
        : undefined;

    const item = await Wishlist.findOneAndUpdate(
      { userId: req.user!._id, medicineId: med._id },
      {
        medicineName: med.name,
        price: med.price,
        pharmacyId: med.pharmacyId,
        pharmacyName,
      },
      { upsert: true, new: true }
    );

    return res.json({
      item: {
        id: item._id.toString(),
        medicineId: item.medicineId.toString(),
        medicineName: item.medicineName,
        price: item.price,
      },
    });
  })
);

router.delete(
  "/wishlist/:medicineId",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    await Wishlist.deleteOne({
      userId: req.user!._id,
      medicineId: req.params.medicineId,
    });
    return res.json({ ok: true });
  })
);

router.get(
  "/recently-viewed",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const items = await RecentlyViewed.find({ userId: req.user!._id })
      .sort({ viewedAt: -1 })
      .limit(12);
    return res.json({
      items: items.map((item) => ({
        medicineId: item.medicineId.toString(),
        medicineName: item.medicineName,
        price: item.price,
        category: item.category,
        pharmacyName: item.pharmacyName,
        viewedAt: item.viewedAt,
      })),
    });
  })
);

router.post(
  "/recently-viewed",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({ medicineId: z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "medicineId required" });

    const med = await MedicineCatalog.findById(parsed.data.medicineId).populate("pharmacyId");
    if (!med) return res.status(404).json({ error: "Medicine not found" });

    const pharmacyName =
      med.pharmacyId && typeof med.pharmacyId === "object" && "name" in med.pharmacyId
        ? (med.pharmacyId as { name: string }).name
        : undefined;

    await RecentlyViewed.findOneAndUpdate(
      { userId: req.user!._id, medicineId: med._id },
      {
        medicineName: med.name,
        price: med.price,
        category: med.category,
        pharmacyName,
        viewedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.json({ ok: true });
  })
);

router.get(
  "/recommendations",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const symptoms = String(req.query.symptoms ?? "").trim();
    const recent = await RecentlyViewed.find({ userId: req.user!._id })
      .sort({ viewedAt: -1 })
      .limit(5);

    if (symptoms) {
      const terms = expandMedicineSearchTerms(symptoms);
      const patterns = terms.length > 0 ? terms : [symptoms];
      const medicines = await MedicineCatalog.find({
        stock: { $gt: 0 },
        $or: patterns.flatMap((term) => [
          { name: { $regex: term, $options: "i" } },
          { category: { $regex: term, $options: "i" } },
        ]),
      })
        .limit(8)
        .populate("pharmacyId");

      return res.json({
        recommendations: medicines.map((m) => ({
          id: m._id.toString(),
          name: m.name,
          price: m.price,
          category: m.category,
          stock: m.stock,
          reason: "Matches your symptoms search",
        })),
        source: "catalog",
      });
    }

    const categories = [...new Set(recent.map((r) => r.category).filter(Boolean))];
    const filter =
      categories.length > 0
        ? { category: { $in: categories }, stock: { $gt: 0 } }
        : { stock: { $gt: 0 } };

    const medicines = await MedicineCatalog.find(filter).sort({ stock: -1 }).limit(8);
    return res.json({
      recommendations: medicines.map((m) => ({
        id: m._id.toString(),
        name: m.name,
        price: m.price,
        category: m.category,
        stock: m.stock,
        reason: categories.length > 0 ? "Based on your browsing" : "Popular in stock",
      })),
      source: "personalized",
    });
  })
);

router.post(
  "/ai-recommend",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const symptoms = String(req.body.symptoms ?? "");
    const ai = await generateAIResponse(
      'Return JSON: {"medicines":[{"name":"...","reason":"...","genericAlternative":"..."}],"warnings":["..."],"disclaimer":"..."}',
      `Recommend OTC medicines for symptoms: ${symptoms}. Include generic alternatives and interaction warnings.`
    );
    const result = parseJsonFromAI(ai.content, {
      medicines: [],
      warnings: [],
      disclaimer: "Consult a healthcare professional before taking any medication.",
    });

    const names = result.medicines.map((m: { name: string }) => m.name).filter(Boolean);
    const inCatalog =
      names.length > 0
        ? await MedicineCatalog.find({
            name: { $in: names.map((n) => new RegExp(n, "i")) },
            stock: { $gt: 0 },
          }).limit(10)
        : [];

    return res.json({
      ...result,
      availableInCatalog: inCatalog.map((m) => ({
        id: m._id.toString(),
        name: m.name,
        price: m.price,
        stock: m.stock,
      })),
      source: ai.source,
    });
  })
);

router.post(
  "/interactions",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({ medicineNames: z.array(z.string()).min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "medicineNames required" });

    const ai = await generateAIResponse(
      'Return JSON: {"warnings":[{"pair":"A + B","severity":"low|medium|high","message":"..."}],"safe":true}',
      `Check drug interactions for: ${parsed.data.medicineNames.join(", ")}`
    );
    const result = parseJsonFromAI(ai.content, { warnings: [], safe: true });
    return res.json({ ...result, source: ai.source });
  })
);

router.post(
  "/repeat-order/:orderId",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await DeliveryOrder.findOne({
      _id: req.params.orderId,
      userId: req.user!._id,
    });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const { Cart } = await import("../models/Cart.js");
    let cart = await Cart.findOne({ userId: req.user!._id });
    if (!cart) cart = await Cart.create({ userId: req.user!._id, items: [] });

    cart.items = [];
    for (const line of order.items) {
      if (!line.medicineId) continue;
      const med = await MedicineCatalog.findById(line.medicineId).populate("pharmacyId");
      if (!med || med.stock <= 0) continue;
      const qty = Math.min(line.quantity, med.stock);
      const pharmacyName =
        med.pharmacyId && typeof med.pharmacyId === "object" && "name" in med.pharmacyId
          ? (med.pharmacyId as { name: string }).name
          : undefined;
      cart.items.push({
        medicineId: med._id,
        medicineName: med.name,
        price: med.price,
        quantity: qty,
        unit: "tablet",
        maxStock: med.stock,
        pharmacyId: med.pharmacyId as typeof med.pharmacyId,
        pharmacyName,
        requiresPrescription: med.requiresPrescription,
      });
    }
    cart.pharmacyId = order.pharmacyId;
    await cart.save();

    return res.json({
      cart: {
        items: cart.items.map((line) => ({
          medicineId: line.medicineId.toString(),
          medicineName: line.medicineName,
          price: line.price,
          quantity: line.quantity,
          unit: line.unit,
          maxStock: line.maxStock,
        })),
        itemCount: cart.items.reduce((s, l) => s + l.quantity, 0),
      },
    });
  })
);

export default router;
