import { Router } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPriorityQueue } from "../services/order.service.js";
import { predictBloodDemand } from "../services/blood.service.js";
import { User } from "../models/User.js";
import { Patient } from "../models/Patient.js";
import { Appointment } from "../models/Appointment.js";
import { Payment } from "../models/Payment.js";
import { Notification } from "../models/Clinical.js";
import { DeliveryOrder, MedicineCatalog, DeliveryAgent } from "../models/Order.js";
import {
  BloodRequest,
  BloodStock,
  BloodEmergencyAlert,
  Donor,
} from "../models/BloodBank.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { generateAIResponse, parseJsonFromAI } from "../services/ai.service.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

function docDate(doc: unknown): Date {
  return (doc as { createdAt: Date }).createdAt;
}

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [users, orders, bloodPending, medicines, donors, payments, patients, appointments] =
      await Promise.all([
        User.countDocuments(),
        DeliveryOrder.countDocuments(),
        BloodRequest.countDocuments({ status: { $nin: ["fulfilled", "cancelled"] } }),
        MedicineCatalog.countDocuments({ stock: { $gt: 0 } }),
        Donor.countDocuments({ isAvailable: true }),
        Payment.find({ status: "completed" }),
        Patient.countDocuments(),
        Appointment.countDocuments(),
      ]);

    const revenue = payments.reduce((s, p) => s + p.amount, 0);
    const queue = await getPriorityQueue();

    return res.json({
      stats: {
        users,
        orders,
        bloodPending,
        medicinesInStock: medicines,
        activeDonors: donors,
        revenue,
        patients,
        appointments,
        emergencyAlerts: await BloodEmergencyAlert.countDocuments({ resolved: false }),
        pharmacies: await Pharmacy.countDocuments(),
        queueLength: queue.length,
      },
      priorityQueue: queue.slice(0, 15),
    });
  })
);

router.get(
  "/orders",
  asyncHandler(async (_req, res) => {
    const orders = await DeliveryOrder.find()
      .populate("userId", "name email")
      .populate("pharmacyId")
      .populate("deliveryAgentId")
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ orders });
  })
);

router.get(
  "/inventory",
  asyncHandler(async (_req, res) => {
    const lowStock = await MedicineCatalog.find({ stock: { $lt: 10 } }).populate("pharmacyId");
    return res.json({ lowStock });
  })
);

router.get(
  "/blood-bank",
  asyncHandler(async (_req, res) => {
    const [stocks, requests, alerts, donors] = await Promise.all([
      BloodStock.find(),
      BloodRequest.find().sort({ createdAt: -1 }).limit(30),
      BloodEmergencyAlert.find({ resolved: false }),
      Donor.find().sort({ rewardPoints: -1 }).limit(20),
    ]);
    return res.json({ stocks, requests, alerts, donors });
  })
);

router.get(
  "/revenue",
  asyncHandler(async (_req, res) => {
    const payments = await Payment.find({ status: "completed" }).sort({ createdAt: 1 });
    const byMonth: Record<string, number> = {};
    for (const p of payments) {
      const key = docDate(p).toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] ?? 0) + p.amount;
    }
    return res.json({
      chart: Object.entries(byMonth).map(([month, amount]) => ({ month, amount })),
      total: payments.reduce((s, p) => s + p.amount, 0),
    });
  })
);

router.get(
  "/pharmacy",
  asyncHandler(async (_req, res) => {
    const [lowStock, orders, medicines, pharmacies] = await Promise.all([
      MedicineCatalog.find({ stock: { $lt: 10 } }).populate("pharmacyId").limit(20),
      DeliveryOrder.find().sort({ createdAt: -1 }).limit(20),
      MedicineCatalog.countDocuments({ stock: { $gt: 0 } }),
      Pharmacy.countDocuments(),
    ]);

    return res.json({
      lowStock: lowStock.map((m) => ({
        id: m._id.toString(),
        medicineName: m.name,
        stock: m.stock,
        pharmacy: m.pharmacyId,
      })),
      orders: orders.map((o) => ({
        _id: o._id.toString(),
        totalAmount: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: (o as { createdAt: Date }).createdAt,
      })),
      stats: { medicinesInStock: medicines, pharmacies },
    });
  })
);

router.get(
  "/medicines",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "").trim();
    const filter = q ? { name: { $regex: q, $options: "i" } } : {};
    const medicines = await MedicineCatalog.find(filter)
      .populate("pharmacyId")
      .sort({ name: 1 })
      .limit(100);
    return res.json({ medicines });
  })
);

router.post(
  "/medicines",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().min(1),
      genericName: z.string().optional(),
      price: z.number().positive(),
      category: z.string().default("general"),
      stock: z.number().min(0),
      expiryDate: z.string(),
      pharmacyId: z.string(),
      requiresPrescription: z.boolean().optional(),
      description: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid medicine data" });

    const med = await MedicineCatalog.create(parsed.data);
    return res.status(201).json({ medicine: med });
  })
);

router.patch(
  "/medicines/:id",
  asyncHandler(async (req, res) => {
    const med = await MedicineCatalog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!med) return res.status(404).json({ error: "Medicine not found" });
    const { syncInventoryFromCatalog } = await import("../services/inventory-sync.service.js");
    await syncInventoryFromCatalog(med._id.toString(), med.stock);
    return res.json({ medicine: med });
  })
);

router.delete(
  "/medicines/:id",
  asyncHandler(async (req, res) => {
    const med = await MedicineCatalog.findByIdAndDelete(req.params.id);
    if (!med) return res.status(404).json({ error: "Medicine not found" });
    return res.json({ ok: true });
  })
);

router.get(
  "/activity",
  asyncHandler(async (_req, res) => {
    const [notifications, bloodReqs, orders] = await Promise.all([
      Notification.find().sort({ createdAt: -1 }).limit(15),
      BloodRequest.find().sort({ createdAt: -1 }).limit(10),
      DeliveryOrder.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const logs = [
      ...notifications.map((n) => ({
        type: "notification",
        message: n.title,
        at: docDate(n),
      })),
      ...bloodReqs.map((r) => ({
        type: "blood_request",
        message: `${r.bloodGroup} — ${r.hospital}`,
        at: docDate(r),
      })),
      ...orders.map((o) => ({
        type: "order",
        message: `Order $${o.totalAmount}`,
        at: docDate(o),
      })),
    ]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 25);

    return res.json({ logs });
  })
);

router.get(
  "/analytics/emergency-response",
  asyncHandler(async (_req, res) => {
    const fulfilled = await BloodRequest.find({ status: "fulfilled" }).limit(50);
    const times = fulfilled.map((r) => {
      const created = docDate(r);
      const updated = (r as { updatedAt: Date }).updatedAt;
      return (updated.getTime() - created.getTime()) / 60_000;
    });
    const avgMinutes =
      times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return res.json({ avgResponseMinutes: avgMinutes, sampleSize: times.length });
  })
);

router.get(
  "/delivery-agents",
  asyncHandler(async (_req, res) => {
    const agents = await DeliveryAgent.find();
    return res.json({ agents });
  })
);

router.get(
  "/ai-insights",
  asyncHandler(async (_req, res) => {
    const [bloodPending, lowStock, revenue] = await Promise.all([
      BloodRequest.countDocuments({ status: "pending" }),
      MedicineCatalog.countDocuments({ stock: { $lt: 5 } }),
      Payment.aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    const ai = await generateAIResponse(
      'Return JSON: {"summary":"...","recommendations":["..."],"riskLevel":"low|medium|high"}',
      `Pending blood: ${bloodPending}, low stock SKUs: ${lowStock}, revenue: ${revenue[0]?.total ?? 0}`
    );

    const insights = parseJsonFromAI(ai.content, {
      summary: "",
      recommendations: [],
      riskLevel: "low",
    });

    const bloodPrediction = await predictBloodDemand();

    return res.json({ insights, bloodPrediction, source: ai.source });
  })
);

export default router;
