import { Router } from "express";
import { z } from "zod";
import { Prescription } from "../models/Clinical.js";
import { DeliveryOrder, MedicineCatalog } from "../models/Order.js";
import { ReturnRequest } from "../models/PharmacyExtras.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { updateOrderStatus } from "../services/order.service.js";
import { toOrderDto } from "../utils/order-dto.js";
import { routeParam } from "../utils/routeParam.js";
import { notifyUser } from "../services/notification.service.js";

const router = Router();

router.use(requireAuth, requireRole("pharmacy", "admin", "doctor"));

router.get(
  "/prescriptions",
  asyncHandler(async (_req, res) => {
    const prescriptions = await Prescription.find({
      status: { $in: ["pending", "under_review"] },
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      prescriptions: prescriptions.map((p) => ({
        id: p._id.toString(),
        userId: typeof p.userId === "object" && p.userId && "name" in p.userId
          ? { id: (p.userId as { _id: { toString(): string } })._id.toString(), name: (p.userId as { name: string }).name }
          : p.userId.toString(),
        medicines: p.medicines,
        rawTextPreview: p.rawTextPreview,
        status: p.status,
        source: p.source,
        createdAt: (p as { createdAt: Date }).createdAt,
      })),
    });
  })
);

router.patch(
  "/prescriptions/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      status: z.enum(["under_review", "approved", "rejected"]),
      pharmacistNotes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid update" });

    const rx = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        status: parsed.data.status,
        pharmacistNotes: parsed.data.pharmacistNotes,
        reviewedBy: req.user!._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );
    if (!rx) return res.status(404).json({ error: "Prescription not found" });

    await notifyUser(rx.userId.toString(), {
      title: "Prescription update",
      body: `Your prescription was ${parsed.data.status.replace("_", " ")}`,
      type: "prescription",
    });

    return res.json({ prescription: rx });
  })
);

router.get(
  "/orders",
  asyncHandler(async (_req, res) => {
    const orders = await DeliveryOrder.find({
      status: { $in: ["pending", "confirmed", "packed", "dispatched"] },
    })
      .populate("userId", "name email phone")
      .populate("pharmacyId")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ orders: orders.map(toOrderDto) });
  })
);

router.patch(
  "/orders/:id/status",
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      status: z.enum(["pending", "confirmed", "packed", "dispatched", "delivered", "cancelled"]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid status" });

    const order = await updateOrderStatus(
      routeParam(req.params.id),
      parsed.data.status,
      req.user!._id.toString()
    );
    return res.json({ order: toOrderDto(order) });
  })
);

router.get(
  "/inventory",
  asyncHandler(async (req, res) => {
    const lowStock = req.query.lowStock === "true";
    const filter = lowStock ? { stock: { $lt: 10 } } : {};
    const medicines = await MedicineCatalog.find(filter)
      .populate("pharmacyId")
      .sort({ stock: 1 })
      .limit(100);
    return res.json({ medicines });
  })
);

router.patch(
  "/inventory/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const stock = Number(req.body.stock);
    if (Number.isNaN(stock) || stock < 0) {
      return res.status(400).json({ error: "Invalid stock" });
    }
    const med = await MedicineCatalog.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    if (!med) return res.status(404).json({ error: "Medicine not found" });

    const { syncInventoryFromCatalog } = await import("../services/inventory-sync.service.js");
    await syncInventoryFromCatalog(med._id.toString(), med.stock);

    return res.json({ medicine: med });
  })
);

router.get(
  "/returns",
  asyncHandler(async (_req, res) => {
    const returns = await ReturnRequest.find({ status: "requested" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(30);
    return res.json({ returns });
  })
);

router.patch(
  "/returns/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      status: z.enum(["approved", "rejected", "refunded"]),
      adminNotes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid status" });

    const ret = await ReturnRequest.findByIdAndUpdate(
      req.params.id,
      { status: parsed.data.status, adminNotes: parsed.data.adminNotes },
      { new: true }
    );
    if (!ret) return res.status(404).json({ error: "Return not found" });

    await DeliveryOrder.findByIdAndUpdate(ret.orderId, {
      returnStatus: parsed.data.status,
      paymentStatus: parsed.data.status === "refunded" ? "refunded" : undefined,
    });

    await notifyUser(ret.userId.toString(), {
      title: "Return update",
      body: `Your return request was ${parsed.data.status}`,
      type: "order",
    });

    return res.json({ return: ret });
  })
);

export default router;
