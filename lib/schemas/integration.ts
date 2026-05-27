import { z } from "zod";

export const assistantMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

export const assistantContextSchema = z
  .object({
    symptoms: z.string().max(500).optional(),
    possibleConditions: z.array(z.string()).optional(),
    urgency: z.string().optional(),
    suggestions: z.array(z.string()).optional(),
  })
  .optional();

export const assistantRequestSchema = z.object({
  messages: z.array(assistantMessageSchema).min(1).max(20),
  context: assistantContextSchema,
});

export const reminderSchema = z.object({
  medicineName: z.string().trim().min(1).max(120),
  dosage: z.string().trim().max(80).optional(),
  schedule: z.enum(["morning", "afternoon", "evening", "bedtime", "custom"]),
  customTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  enabled: z.boolean().default(true),
  channel: z.enum(["push", "email", "both"]).default("push"),
  source: z.enum(["manual", "prescription", "barcode"]).default("manual"),
});

export const reminderUpdateSchema = reminderSchema.partial().extend({
  id: z.string(),
});

export const appointmentSchema = z.object({
  providerName: z.string().trim().min(2).max(80),
  specialty: z.string().trim().min(2).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(["virtual", "in-person"]),
  notes: z.string().trim().max(300).optional(),
});

export const appointmentUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  notes: z.string().trim().max(300).optional(),
});

export const wearableConnectSchema = z.object({
  provider: z.enum(["apple_health", "fitbit", "garmin"]),
});
