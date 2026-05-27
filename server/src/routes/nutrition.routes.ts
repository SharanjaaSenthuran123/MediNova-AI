import { Router } from "express";
import { z } from "zod";
import {
  DietPlan,
  NutritionLog,
  BmiRecord,
  WaterTracking,
  FastingSession,
  HEALTH_CONDITIONS,
  type IDietPlan,
} from "../models/Nutrition.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAIResponse, parseJsonFromAI } from "../services/ai.service.js";

const router = Router();

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function calcBmi(weightKg: number, heightCm: number) {
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);
  let category = "Normal";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";
  return { bmi: Math.round(bmi * 10) / 10, category };
}

router.get(
  "/dashboard",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    const date = todayStr();

    const [plan, log, water, latestBmi, activeFast] = await Promise.all([
      DietPlan.findOne({ userId }).sort({ createdAt: -1 }),
      NutritionLog.findOne({ userId, date }),
      WaterTracking.findOne({ userId, date }),
      BmiRecord.findOne({ userId }).sort({ createdAt: -1 }),
      FastingSession.findOne({ userId, status: "active" }),
    ]);

    const weekLogs = await NutritionLog.find({
      userId,
      date: { $gte: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10) },
    }).sort({ date: 1 });

    return res.json({
      plan,
      todayLog: log,
      water: water ?? { glasses: 0, targetGlasses: 8, date },
      bmi: latestBmi,
      activeFast,
      weeklyCalories: weekLogs.map((l) => ({
        date: l.date,
        calories: l.totalCalories,
        target: plan?.dailyCalorieTarget ?? 2000,
      })),
    });
  })
);

router.post(
  "/bmi",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      weightKg: z.number().positive(),
      heightCm: z.number().positive(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid BMI data" });

    const { bmi, category } = calcBmi(parsed.data.weightKg, parsed.data.heightCm);
    const record = await BmiRecord.create({
      userId: req.user!._id,
      ...parsed.data,
      bmi,
      category,
    });

    return res.json({ record });
  })
);

router.get(
  "/bmi/history",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const records = await BmiRecord.find({ userId: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json({ records });
  })
);

router.post(
  "/diet-plan/generate",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      condition: z.enum(HEALTH_CONDITIONS),
      weightKg: z.number().optional(),
      heightCm: z.number().optional(),
      age: z.number().optional(),
      language: z.string().default("en"),
      allergies: z.array(z.string()).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid plan request" });

    const { condition, weightKg, heightCm, age, language, allergies } = parsed.data;

    const ai = await generateAIResponse(
      `You are a clinical nutritionist AI. Generate a 7-day personalized diet plan as JSON only:
{"dailyCalorieTarget":number,"meals":[{"day":"Monday","breakfast":"...","lunch":"...","dinner":"...","snacks":"..."},...]}
Condition: ${condition}. Language: ${language}. Consider allergies: ${allergies?.join(", ") ?? "none"}.
Weight: ${weightKg ?? "unknown"}kg, Height: ${heightCm ?? "unknown"}cm, Age: ${age ?? "unknown"}.`,
      "Generate my weekly diet plan."
    );

    const parsedPlan = parseJsonFromAI<{
      dailyCalorieTarget: number;
      meals: IDietPlan["meals"];
    }>(ai.content, {
      dailyCalorieTarget: 2000,
      meals: [],
    });

    const plan = await DietPlan.create({
      userId: req.user!._id,
      condition,
      dailyCalorieTarget: parsedPlan.dailyCalorieTarget,
      meals: parsedPlan.meals,
      aiGenerated: true,
      language,
    });

    return res.json({ plan, aiSource: ai.source });
  })
);

router.get(
  "/diet-plan",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const plan = await DietPlan.findOne({ userId: req.user!._id }).sort({ createdAt: -1 });
    return res.json({ plan });
  })
);

router.post(
  "/log",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      date: z.string().optional(),
      meals: z.array(
        z.object({ name: z.string(), calories: z.number(), time: z.string().optional() })
      ),
      notes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid log data" });

    const date = parsed.data.date ?? todayStr();
    const totalCalories = parsed.data.meals.reduce((s, m) => s + m.calories, 0);

    const log = await NutritionLog.findOneAndUpdate(
      { userId: req.user!._id, date },
      {
        meals: parsed.data.meals,
        totalCalories,
        notes: parsed.data.notes,
      },
      { upsert: true, new: true }
    );

    return res.json({ log });
  })
);

router.post(
  "/water",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      glasses: z.number().min(0),
      targetGlasses: z.number().optional(),
      date: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid water data" });

    const date = parsed.data.date ?? todayStr();
    const water = await WaterTracking.findOneAndUpdate(
      { userId: req.user!._id, date },
      {
        glasses: parsed.data.glasses,
        ...(parsed.data.targetGlasses !== undefined && {
          targetGlasses: parsed.data.targetGlasses,
        }),
      },
      { upsert: true, new: true }
    );

    return res.json({ water });
  })
);

router.post(
  "/fasting/start",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    await FastingSession.updateMany(
      { userId: req.user!._id, status: "active" },
      { status: "cancelled", endTime: new Date() }
    );

    const targetHours = Number(req.body.targetHours ?? 16);
    const session = await FastingSession.create({
      userId: req.user!._id,
      startTime: new Date(),
      targetHours,
      status: "active",
    });

    return res.json({ session });
  })
);

router.post(
  "/fasting/end",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const session = await FastingSession.findOneAndUpdate(
      { userId: req.user!._id, status: "active" },
      { status: "completed", endTime: new Date() },
      { new: true }
    );

    return res.json({ session });
  })
);

router.post(
  "/chat",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const message = String(req.body.message ?? "");
    const history = req.body.history ?? [];

    const ai = await generateAIResponse(
      "You are MediNova Nutrition Assistant. Provide safe, personalized nutrition advice. Recommend professional care for medical emergencies. Support multiple languages if asked.",
      message,
      history
    );

    return res.json({ reply: ai.content, source: ai.source });
  })
);

router.post(
  "/grocery-suggestions",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const plan = await DietPlan.findOne({ userId: req.user!._id }).sort({ createdAt: -1 });
    const ai = await generateAIResponse(
      "Return a JSON array of grocery items: [{\"item\":\"...\",\"quantity\":\"...\",\"category\":\"...\"}]",
      `Suggest grocery list for this diet plan condition: ${plan?.condition ?? "general"}, calories: ${plan?.dailyCalorieTarget ?? 2000}`
    );

    const items = parseJsonFromAI<{ item: string; quantity: string; category: string }[]>(
      ai.content,
      []
    );

    return res.json({ items, source: ai.source });
  })
);

router.post(
  "/alternatives",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const food = String(req.body.food ?? "");
    const condition = String(req.body.condition ?? "general");

    const ai = await generateAIResponse(
      "Return JSON: {\"alternatives\":[{\"name\":\"...\",\"calories\":number,\"benefit\":\"...\"}],\"calorieWarning\":\"...\"}",
      `Suggest healthy alternatives for "${food}" for condition: ${condition}`
    );

    const result = parseJsonFromAI(ai.content, {
      alternatives: [],
      calorieWarning: "",
    });

    return res.json({ ...result, source: ai.source });
  })
);

router.get(
  "/weekly-report",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

    const [logs, waterLogs, bmiRecords] = await Promise.all([
      NutritionLog.find({ userId, date: { $gte: since } }),
      WaterTracking.find({ userId, date: { $gte: since } }),
      BmiRecord.find({ userId }).sort({ createdAt: -1 }).limit(1),
    ]);

    const avgCalories =
      logs.length > 0
        ? Math.round(logs.reduce((s, l) => s + l.totalCalories, 0) / logs.length)
        : 0;
    const avgWater =
      waterLogs.length > 0
        ? Math.round(waterLogs.reduce((s, w) => s + w.glasses, 0) / waterLogs.length)
        : 0;

    return res.json({
      report: {
        period: "7 days",
        avgCalories,
        avgWaterGlasses: avgWater,
        daysLogged: logs.length,
        latestBmi: bmiRecords[0] ?? null,
        calorieTrend: logs.map((l) => ({ date: l.date, calories: l.totalCalories })),
      },
    });
  })
);

export default router;
