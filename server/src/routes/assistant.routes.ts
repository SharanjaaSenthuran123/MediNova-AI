import { Router } from "express";
import { env } from "../config/env.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const message = String(req.body.message ?? "");

  if (!env.openaiKey) {
    return res.json({
      reply:
        "I'm your MediNova AI assistant (demo mode). Connect OPENAI_API_KEY for live responses. How can I help with your health today?",
      source: "demo",
    });
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
              "You are MediNova AI, a helpful healthcare assistant. Provide safe, concise guidance and always recommend professional care for emergencies.",
          },
          ...(req.body.history ?? []),
          { role: "user", content: message },
        ],
      }),
    });

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply =
      data.choices?.[0]?.message?.content ??
      "I could not generate a response. Please try again.";

    return res.json({ reply, source: "openai" });
  } catch {
    return res.json({
      reply: "Assistant temporarily unavailable. Please try again.",
      source: "demo",
    });
  }
});

export default router;
