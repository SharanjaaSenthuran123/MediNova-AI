import { Router } from "express";
import { z } from "zod";
import { Cart } from "../models/Cart.js";
import { MedicineCatalog } from "../models/Order.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

function toCartDto(cart: InstanceType<typeof Cart>) {
  return {
    items: cart.items.map((line) => ({
      medicineId: line.medicineId.toString(),
      medicineName: line.medicineName,
      price: line.price,
      quantity: line.quantity,
      unit: line.unit,
      maxStock: line.maxStock,
      pharmacyId: line.pharmacyId?.toString(),
      pharmacyName: line.pharmacyName,
      requiresPrescription: line.requiresPrescription,
    })),
    pharmacyId: cart.pharmacyId?.toString(),
    itemCount: cart.items.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: cart.items.reduce((sum, line) => sum + line.price * line.quantity, 0),
  };
}

async function getOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

/** Remove out-of-stock or deleted medicines from cart. */
async function purgeExpiredCartItems(cart: InstanceType<typeof Cart>) {
  if (cart.items.length === 0) return cart;

  const validItems = [];
  for (const line of cart.items) {
    const med = await MedicineCatalog.findById(line.medicineId);
    if (!med || med.stock <= 0) continue;
    line.maxStock = med.stock;
    line.price = med.price;
    if (line.quantity > med.stock) line.quantity = med.stock;
    validItems.push(line);
  }

  cart.items = validItems;
  if (cart.items.length === 0) cart.pharmacyId = undefined;
  await cart.save();
  return cart;
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const cart = await getOrCreateCart(req.user!._id.toString());
    await purgeExpiredCartItems(cart);
    return res.json({ cart: toCartDto(cart) });
  })
);

router.post(
  "/add",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      medicineId: z.string(),
      quantity: z.coerce.number().int().min(1).default(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid cart item" });

    const med = await MedicineCatalog.findById(parsed.data.medicineId).populate("pharmacyId");
    if (!med) return res.status(404).json({ error: "Medicine not found" });

    const pharmacyId = med.pharmacyId.toString();
    const pharmacyName =
      med.pharmacyId && typeof med.pharmacyId === "object" && "name" in med.pharmacyId
        ? (med.pharmacyId as { name: string }).name
        : undefined;

    const cart = await getOrCreateCart(req.user!._id.toString());
    const existing = cart.items.find((line) => line.medicineId.toString() === parsed.data.medicineId);
    const nextQty = (existing?.quantity ?? 0) + parsed.data.quantity;

    if (
      cart.items.length > 0 &&
      cart.pharmacyId &&
      cart.pharmacyId.toString() !== pharmacyId
    ) {
      return res.status(400).json({
        error: "Cart supports one pharmacy per order. Clear cart or checkout first.",
      });
    }

    if (nextQty > med.stock) {
      return res.status(400).json({ error: `Only ${med.stock} in stock` });
    }

    if (existing) {
      existing.quantity = nextQty;
      existing.maxStock = med.stock;
      existing.price = med.price;
    } else {
      cart.items.push({
        medicineId: med._id,
        medicineName: med.name,
        price: med.price,
        quantity: parsed.data.quantity,
        unit: "tablet",
        maxStock: med.stock,
        pharmacyId: med.pharmacyId as typeof med.pharmacyId,
        pharmacyName,
        requiresPrescription: med.requiresPrescription,
      });
    }

    cart.pharmacyId = med.pharmacyId as typeof med.pharmacyId;
    await cart.save();

    return res.json({ cart: toCartDto(cart) });
  })
);

router.put(
  "/update",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      medicineId: z.string(),
      quantity: z.coerce.number().int().min(0),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid update" });

    const cart = await getOrCreateCart(req.user!._id.toString());
    const line = cart.items.find((entry) => entry.medicineId.toString() === parsed.data.medicineId);
    if (!line) return res.status(404).json({ error: "Item not in cart" });

    if (parsed.data.quantity === 0) {
      cart.items = cart.items.filter(
        (entry) => entry.medicineId.toString() !== parsed.data.medicineId
      );
    } else {
      const med = await MedicineCatalog.findById(parsed.data.medicineId);
      if (!med) return res.status(404).json({ error: "Medicine not found" });
      if (parsed.data.quantity > med.stock) {
        return res.status(400).json({ error: `Only ${med.stock} in stock` });
      }
      line.quantity = parsed.data.quantity;
      line.maxStock = med.stock;
      line.price = med.price;
    }

    if (cart.items.length === 0) cart.pharmacyId = undefined;
    await cart.save();

    return res.json({ cart: toCartDto(cart) });
  })
);

router.delete(
  "/remove",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const medicineId = String(req.body.medicineId ?? req.query.medicineId ?? "");
    if (!medicineId) return res.status(400).json({ error: "medicineId required" });

    const cart = await getOrCreateCart(req.user!._id.toString());
    cart.items = cart.items.filter((entry) => entry.medicineId.toString() !== medicineId);
    if (cart.items.length === 0) cart.pharmacyId = undefined;
    await cart.save();

    return res.json({ cart: toCartDto(cart) });
  })
);

router.delete(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    await Cart.findOneAndUpdate({ userId: req.user!._id }, { items: [], pharmacyId: undefined });
    return res.json({ cart: { items: [], itemCount: 0, subtotal: 0 } });
  })
);

export default router;
