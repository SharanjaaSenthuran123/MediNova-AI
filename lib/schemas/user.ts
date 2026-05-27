import { z } from "zod";
import { symptomRequestSchema } from "@/lib/schemas/symptom";

export const userProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email"),
  age: z.number().int().min(1).max(120).optional(),
  gender: z.string().trim().max(40).optional(),
});

export const emergencyContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(80),
  relation: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(3).max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
});

export const emergencyContactsSchema = z.array(emergencyContactSchema).max(10);

export const symptomHistorySchema = z.object({
  input: symptomRequestSchema,
  result: z.object({
    possibleConditions: z.array(z.string()),
    urgency: z.enum(["low", "moderate", "high", "emergency"]),
    suggestions: z.array(z.string()),
    seekDoctorIf: z.array(z.string()),
    disclaimer: z.string(),
    source: z.enum(["openai", "demo"]).optional(),
  }),
});

export const prescriptionHistorySchema = z.object({
  medicines: z.array(z.string()),
  rawTextPreview: z.string().max(500),
  source: z.enum(["ocr", "demo", "openai"]).optional(),
});

export const barcodeHistorySchema = z.object({
  barcode: z.string().trim().min(3).max(32),
  medicineName: z.string().trim().max(120),
  expiry: z.string().trim().max(20).optional(),
  found: z.boolean(),
});
