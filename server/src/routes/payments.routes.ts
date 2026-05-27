import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { Payment, Subscription, Invoice } from "../models/Payment.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import { emitToUser } from "../services/socket.service.js";

const router = Router();

function invoiceNumber() {
  return `INV-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

router.get(
  "/history",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const [payments, invoices] = await Promise.all([
      Payment.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(50),
      Invoice.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(50),
    ]);

    return res.json({ payments, invoices });
  })
);

router.get(
  "/subscriptions",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const subscriptions = await Subscription.find({ userId: req.user!._id }).sort({
      createdAt: -1,
    });
    return res.json({ subscriptions });
  })
);

router.get(
  "/analytics",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const payments = await Payment.find({
      userId: req.user!._id,
      status: "completed",
    });

    const total = payments.reduce((s, p) => s + p.amount, 0);
    const byPurpose: Record<string, number> = {};
    const byProvider: Record<string, number> = {};

    for (const p of payments) {
      byPurpose[p.purpose] = (byPurpose[p.purpose] ?? 0) + p.amount;
      byProvider[p.provider] = (byProvider[p.provider] ?? 0) + p.amount;
    }

    return res.json({
      analytics: {
        totalSpent: total,
        transactionCount: payments.length,
        byPurpose,
        byProvider,
        recent: payments.slice(0, 10),
      },
    });
  })
);

router.post(
  "/checkout",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      amount: z.number().positive(),
      currency: z.string().default("USD"),
      provider: z.enum(["stripe", "payhere", "paypal"]),
      purpose: z.enum(["appointment", "medicine", "subscription", "donation"]),
      referenceId: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
      plan: z.enum(["basic", "premium", "enterprise"]).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid checkout data" });

    const payment = await Payment.create({
      userId: req.user!._id,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      provider: parsed.data.provider,
      purpose: parsed.data.purpose,
      referenceId: parsed.data.referenceId,
      status: "pending",
      metadata: parsed.data.metadata,
    });

    let checkoutUrl: string | null = null;
    let clientSecret: string | null = null;

    if (parsed.data.provider === "stripe" && env.stripeSecretKey) {
      try {
        const params = new URLSearchParams();
        params.set("amount", String(Math.round(parsed.data.amount * 100)));
        params.set("currency", parsed.data.currency.toLowerCase());
        params.set("payment_method_types[]", "card");
        params.set("metadata[paymentId]", payment._id.toString());
        params.set("metadata[userId]", req.user!._id.toString());

        const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        const stripeData = (await stripeRes.json()) as {
          client_secret?: string;
          id?: string;
          error?: { message?: string };
        };

        if (stripeData.client_secret) {
          clientSecret = stripeData.client_secret;
          payment.externalId = stripeData.id;
          await payment.save();
        }
      } catch {
        /* fall through to manual confirm */
      }
    }

    if (parsed.data.provider === "paypal" && env.paypalClientId) {
      checkoutUrl = `https://www.paypal.com/checkoutnow?token=sim_${payment._id}`;
    }

    if (parsed.data.provider === "payhere" && env.payhereMerchantId) {
      checkoutUrl = `${env.clientUrl}/payments/payhere?paymentId=${payment._id}`;
    }

    return res.json({
      payment,
      checkoutUrl,
      clientSecret,
      stripePublishableKey: env.stripePublishableKey || null,
    });
  })
);

router.post(
  "/confirm",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const paymentId = String(req.body.paymentId ?? "");
    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user!._id,
    });

    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status === "completed") return res.json({ payment, invoice: null });

    payment.status = "completed";
    await payment.save();

    const invoice = await Invoice.create({
      userId: req.user!._id,
      paymentId: payment._id,
      invoiceNumber: invoiceNumber(),
      amount: payment.amount,
      currency: payment.currency,
      description: `${payment.purpose} payment via ${payment.provider}`,
      status: "paid",
    });

    if (payment.purpose === "subscription") {
      const plan = (payment.metadata as { plan?: string })?.plan ?? "premium";
      await Subscription.create({
        userId: req.user!._id,
        plan: plan as "basic" | "premium" | "enterprise",
        provider: payment.provider,
        externalId: payment.externalId,
        status: "active",
        amount: payment.amount,
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      });
    }

    emitToUser(req.user!._id.toString(), "notification", {
      title: "Payment successful",
      body: `$${payment.amount.toFixed(2)} — Invoice ${invoice.invoiceNumber}`,
    });

    return res.json({ payment, invoice });
  })
);

router.post(
  "/subscriptions/cancel",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const subId = String(req.body.subscriptionId ?? "");
    const sub = await Subscription.findOneAndUpdate(
      { _id: subId, userId: req.user!._id },
      { status: "cancelled" },
      { new: true }
    );

    if (!sub) return res.status(404).json({ error: "Subscription not found" });
    return res.json({ subscription: sub });
  })
);

export default router;
