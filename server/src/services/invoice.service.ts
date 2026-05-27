import crypto from "crypto";
import { Invoice } from "../models/Payment.js";
import type { IDeliveryOrder } from "../models/Order.js";

export function invoiceNumber() {
  return `INV-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createOrderInvoice(
  userId: string,
  order: IDeliveryOrder & { createdAt?: Date }
) {
  const number = invoiceNumber();
  const invoice = await Invoice.create({
    userId,
    orderId: order._id,
    amount: order.totalAmount,
    currency: "USD",
    status: order.paymentStatus === "paid" ? "paid" : "sent",
    invoiceNumber: number,
    description: `Medicine order #${order._id.toString().slice(-6)}`,
    lineItems: order.items.map((item) => ({
      description: item.medicineName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  });

  return invoice;
}

export function buildInvoiceHtml(
  order: IDeliveryOrder & { createdAt?: Date },
  invoiceNum: string,
  customerName: string
) {
  const date = (order.createdAt ?? new Date()).toLocaleString();
  const rows = order.items
    .map(
      (item) =>
        `<tr><td>${item.medicineName}</td><td>${item.quantity}</td><td>$${item.unitPrice.toFixed(2)}</td><td>$${(item.unitPrice * item.quantity).toFixed(2)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice ${invoiceNum}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;color:#111}
h1{color:#0d9488}table{width:100%;border-collapse:collapse;margin:1rem 0}
th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0fdfa}
.total{font-size:1.2rem;font-weight:bold;text-align:right;margin-top:1rem}
</style></head><body>
<h1>MediNova AI Pharmacy</h1>
<p><strong>Invoice:</strong> ${invoiceNum}<br>
<strong>Order:</strong> #${order._id.toString().slice(-6).toUpperCase()}<br>
<strong>Date:</strong> ${date}<br>
<strong>Customer:</strong> ${customerName}</p>
<table><thead><tr><th>Medicine</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
<tbody>${rows}</tbody></table>
<p>Subtotal: $${(order.subtotal ?? order.totalAmount).toFixed(2)}</p>
<p>Delivery fee: $${(order.deliveryFee ?? 0).toFixed(2)}</p>
<p class="total">Total: $${order.totalAmount.toFixed(2)}</p>
<p>Payment: ${order.paymentMethod.toUpperCase()} — ${order.paymentStatus}</p>
<p style="color:#666;font-size:0.85rem">Thank you for choosing MediNova AI Pharmacy.</p>
</body></html>`;
}
