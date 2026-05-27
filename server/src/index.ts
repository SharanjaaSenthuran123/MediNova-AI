import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { initSocket } from "./services/socket.service.js";
import { ensurePharmacyBootstrap } from "./services/pharmacy-bootstrap.service.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import patientsRoutes from "./routes/patients.routes.js";
import doctorsRoutes from "./routes/doctors.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import historyRoutes from "./routes/history.routes.js";
import remindersRoutes from "./routes/reminders.routes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import configRoutes from "./routes/config.routes.js";
import symptomRoutes from "./routes/symptom.routes.js";
import assistantRoutes from "./routes/assistant.routes.js";
import wearablesRoutes from "./routes/wearables.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import nutritionRoutes from "./routes/nutrition.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import bloodbankRoutes from "./routes/bloodbank.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import pharmacySmartRoutes from "./routes/pharmacy-smart.routes.js";
import addressesRoutes from "./routes/addresses.routes.js";
import pharmacistRoutes from "./routes/pharmacist.routes.js";

async function main() {
  await connectDatabase();
  await ensurePharmacyBootstrap();

  const app = express();
  const server = http.createServer(app);
  initSocket(server);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(morgan("dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use("/api", rateLimit({ windowMs: 60_000, max: 200 }));

  app.get("/", (_req, res) => {
    res.redirect(302, env.clientUrl);
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "medinova-api", production: true });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "medinova-api", production: true });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/patients", patientsRoutes);
  app.use("/api/doctors", doctorsRoutes);
  app.use("/api/appointments", appointmentsRoutes);
  app.use("/api/medicine-lookup", medicineRoutes);
  app.use("/api/history", historyRoutes);
  app.use("/api/reminders", remindersRoutes);
  app.use("/api/emergency-alert", emergencyRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/config", configRoutes);
  app.use("/api/symptom-checker", symptomRoutes);
  app.use("/api/assistant", assistantRoutes);
  app.use("/api/wearables", wearablesRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/nutrition", nutritionRoutes);
  app.use("/api/pharmacy", pharmacyRoutes);
  app.use("/api/blood-bank", bloodbankRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/pharmacy/smart", pharmacySmartRoutes);
  app.use("/api/addresses", addressesRoutes);
  app.use("/api/pharmacist", pharmacistRoutes);

  app.use(errorHandler);

  server.listen(env.port, "0.0.0.0", () => {
    console.log(`MediNova API (production) running on http://localhost:${env.port}`);
    console.log(`  Frontend: ${env.clientUrl}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
