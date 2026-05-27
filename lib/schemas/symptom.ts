import { z } from "zod";

export const symptomRequestSchema = z.object({
  symptoms: z
    .string()
    .min(3, "Please describe your symptoms in at least 3 characters")
    .max(2000, "Symptoms description is too long (max 2000 characters)"),
  age: z.coerce
    .number()
    .int("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(120, "Age must be 120 or less"),
  gender: z.string().min(1).max(50),
  duration: z
    .string()
    .min(1, "Please enter how long you've had symptoms")
    .max(100),
  severity: z.enum(["mild", "moderate", "severe"]),
});

const conditionMatchSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(100),
});

export const symptomResultSchema = z.object({
  possibleConditions: z.array(z.string()).min(1).max(6),
  conditions: z.array(conditionMatchSchema).optional(),
  urgency: z.enum(["low", "moderate", "high", "emergency"]),
  urgencyScore: z.number().min(0).max(100).optional(),
  overallConfidence: z.number().min(0).max(100).optional(),
  suggestions: z.array(z.string()).min(1).max(8),
  seekDoctorIf: z.array(z.string()).min(1).max(8),
  disclaimer: z.string().min(10),
  source: z.enum(["openai", "demo"]).optional(),
});

export type SymptomRequestInput = z.infer<typeof symptomRequestSchema>;
