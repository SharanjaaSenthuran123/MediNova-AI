import { Router } from "express";
import { env } from "../config/env.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const demoFallback = {
  summary: "Based on your symptoms, rest and hydration are recommended.",
  possibleConditions: [
    { name: "Common cold", likelihood: "moderate" },
    { name: "Seasonal allergies", likelihood: "low" },
  ],
  recommendations: [
    "Monitor symptoms for 48 hours",
    "Seek care if fever exceeds 101°F",
    "Stay hydrated and get adequate rest",
  ],
  urgency: "low" as const,
  disclaimer: "AI guidance only — not a medical diagnosis.",
};

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  if (!env.openaiKey) {
    return res.json({ result: demoFallback, source: "demo" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.openaiModel,
        messages: [
          {
            role: "system",
            content:
              "You are a healthcare triage assistant. Return JSON with summary, possibleConditions, recommendations, urgency, disclaimer.",
          },
          { role: "user", content: JSON.stringify(req.body) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI response");

    return res.json({ result: JSON.parse(content), source: "openai" });
  } catch {
    return res.json({ result: demoFallback, source: "demo" });
  }
});

export default router;
