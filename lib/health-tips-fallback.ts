export type HealthTipCategory =
  | "hydration"
  | "sleep"
  | "exercise"
  | "wellness"
  | "nutrition";

export interface HealthTip {
  id: string;
  category: HealthTipCategory;
  title: string;
  body: string;
  badge: string;
}

const DEMO_TIPS: HealthTip[] = [
  {
    id: "h1",
    category: "hydration",
    title: "Morning hydration boost",
    body: "Drink a glass of water within 30 minutes of waking to kick-start metabolism and support cognitive focus.",
    badge: "Hydration",
  },
  {
    id: "s1",
    category: "sleep",
    title: "Consistent sleep window",
    body: "Try going to bed and waking at the same time daily — even on weekends — to strengthen your circadian rhythm.",
    badge: "Sleep",
  },
  {
    id: "e1",
    category: "exercise",
    title: "Micro movement breaks",
    body: "Stand and stretch for 2 minutes every hour. Short movement breaks reduce stiffness and support heart health.",
    badge: "Exercise",
  },
  {
    id: "w1",
    category: "wellness",
    title: "Breathing reset",
    body: "Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Repeat 3 times when stress peaks.",
    badge: "Wellness",
  },
  {
    id: "n1",
    category: "nutrition",
    title: "Colorful plate rule",
    body: "Aim for 3+ colors on your plate at lunch — diverse produce supports fiber, vitamins, and sustained energy.",
    badge: "Nutrition",
  },
  {
    id: "h2",
    category: "hydration",
    title: "Electrolyte balance",
    body: "After exercise, pair water with foods rich in potassium (banana, yogurt) to support recovery.",
    badge: "Hydration",
  },
];

export function getDemoHealthTips(count = 4): HealthTip[] {
  const shuffled = [...DEMO_TIPS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getDailyInsight(): string {
  const insights = [
    "Small consistent habits outperform occasional intense efforts — focus on one improvement today.",
    "Your body signals through sleep, hydration, and energy — track patterns, not perfection.",
    "Preventive wellness is an investment: regular movement and rest reduce long-term health risks.",
  ];
  const dayIndex = new Date().getDate() % insights.length;
  return insights[dayIndex]!;
}
