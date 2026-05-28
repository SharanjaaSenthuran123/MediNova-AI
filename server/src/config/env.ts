import { loadEnvFiles } from "./loadEnv.js";
import { resolveMongoUri } from "../lib/mongo-uri.js";

loadEnvFiles();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: resolveMongoUri(process.env),
  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;
    if (!secret && process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return secret ?? "medinova-dev-secret-change-me";
  })(),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "MediNova AI <noreply@medinova.ai>",
  },
  openaiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
    authToken: process.env.TWILIO_AUTH_TOKEN ?? "",
    fromNumber: process.env.TWILIO_FROM_NUMBER ?? "",
  },
  /** Twilio trial: route all SOS SMS to one verified number */
  emergencySmsTo: process.env.EMERGENCY_SMS_TO ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  paypalClientId: process.env.PAYPAL_CLIENT_ID ?? "",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? "",
  payhereMerchantId: process.env.PAYHERE_MERCHANT_ID ?? "",
  payhereMerchantSecret: process.env.PAYHERE_MERCHANT_SECRET ?? "",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
};
