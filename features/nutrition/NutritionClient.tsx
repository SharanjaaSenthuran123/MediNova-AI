"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Apple,
  Calculator,
  Droplets,
  MessageCircle,
  Timer,
  Utensils,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { apiFetch, apiPost } from "@/lib/api/client";
import { FeaturePageShell } from "@/components/layout/FeaturePageShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Skeleton } from "@/components/ui/Skeleton";
import { HEALTH_CONDITIONS, type NutritionDashboard } from "@/types/nutrition";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "planner" | "bmi" | "water" | "fasting" | "chat";

export function NutritionClient() {
  const [data, setData] = useState<NutritionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [generating, setGenerating] = useState(false);
  const [condition, setCondition] = useState("diabetes");
  const [language, setLanguage] = useState("en");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [grocery, setGrocery] = useState<{ item: string; quantity: string; category: string }[]>([]);

  const load = useCallback(async () => {
    try {
      const dash = await apiFetch<NutritionDashboard>("/api/nutrition/dashboard");
      setData(dash);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load nutrition data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const res = await apiPost<{ plan: NutritionDashboard["plan"] }>(
        "/api/nutrition/diet-plan/generate",
        {
          condition,
          language,
          weightKg: weight ? Number(weight) : undefined,
          heightCm: height ? Number(height) : undefined,
        }
      );
      toast.success("AI diet plan generated");
      setData((d) => (d ? { ...d, plan: res.plan } : d));
      setTab("planner");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const logMeal = async () => {
    if (!mealName || !mealCalories) return;
    try {
      const existing = data?.todayLog?.meals ?? [];
      await apiPost("/api/nutrition/log", {
        meals: [...existing, { name: mealName, calories: Number(mealCalories) }],
      });
      setMealName("");
      setMealCalories("");
      toast.success("Meal logged");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log meal");
    }
  };

  const updateWater = async (glasses: number) => {
    try {
      await apiPost("/api/nutrition/water", { glasses });
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update water");
    }
  };

  const calcBmi = async () => {
    if (!weight || !height) return;
    try {
      await apiPost("/api/nutrition/bmi", {
        weightKg: Number(weight),
        heightCm: Number(height),
      });
      toast.success("BMI recorded");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to calculate BMI");
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((m) => [...m, { role: "user", content: msg }]);
    setChatLoading(true);
    try {
      const res = await apiPost<{ reply: string }>("/api/nutrition/chat", {
        message: msg,
        history: chatMessages,
      });
      setChatMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setChatLoading(false);
    }
  };

  const loadGrocery = async () => {
    try {
      const res = await apiPost<{ items: typeof grocery }>(
        "/api/nutrition/grocery-suggestions",
        {}
      );
      setGrocery(res.items);
      toast.success("Grocery list generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load grocery list");
    }
  };

  const startFast = async () => {
    try {
      await apiPost("/api/nutrition/fasting/start", { targetHours: 16 });
      toast.success("Fasting started");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start fast");
    }
  };

  const endFast = async () => {
    try {
      await apiPost("/api/nutrition/fasting/end", {});
      toast.success("Fasting completed");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to end fast");
    }
  };

  const calorieTarget = data?.plan?.dailyCalorieTarget ?? 2000;
  const todayCalories = data?.todayLog?.totalCalories ?? 0;
  const caloriePct = Math.min(100, Math.round((todayCalories / calorieTarget) * 100));
  const waterPct = data
    ? Math.min(100, Math.round((data.water.glasses / data.water.targetGlasses) * 100))
    : 0;

  const tabs: { id: Tab; label: string; icon: typeof Apple }[] = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "planner", label: "Meal Planner", icon: Utensils },
    { id: "bmi", label: "BMI", icon: Calculator },
    { id: "water", label: "Water", icon: Droplets },
    { id: "fasting", label: "Fasting", icon: Timer },
    { id: "chat", label: "Assistant", icon: MessageCircle },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <FeaturePageShell
      title="AI Nutrition & Diet Planner"
      description="Personalized diet plans, calorie tracking, BMI calculator, and nutrition assistant."
      eyebrow="Nutrition"
      disclaimer="AI nutrition guidance supports wellness planning — not a substitute for professional medical or dietary advice."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <Button
              key={t.id}
              variant={tab === t.id ? "primary" : "outline"}
              size="sm"
              onClick={() => setTab(t.id)}
            >
              <Icon className="mr-1.5 h-4 w-4" />
              {t.label}
            </Button>
          );
        })}
      </div>

      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Today's Calories", value: `${todayCalories}/${calorieTarget}`, pct: caloriePct, color: "from-primary to-secondary" },
              { label: "Water Intake", value: `${data?.water.glasses ?? 0}/${data?.water.targetGlasses ?? 8} glasses`, pct: waterPct, color: "from-secondary to-accent" },
              { label: "BMI", value: data?.bmi ? `${data.bmi.bmi} (${data.bmi.category})` : "Not set", pct: 0, color: "from-accent to-primary" },
              { label: "Condition Plan", value: data?.plan?.condition ?? "None", pct: 0, color: "from-warning to-danger" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted">{stat.label}</CardTitle>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardHeader>
                  {stat.pct > 0 && (
                    <div className="px-6 pb-4">
                      <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                        <motion.div
                          className={cn("h-full rounded-full bg-gradient-to-r", stat.color)}
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.pct}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {data?.weeklyCalories && data.weeklyCalories.length > 0 && (
            <Card className="glass p-4">
              <CardHeader>
                <CardTitle>Weekly Calorie Trend</CardTitle>
              </CardHeader>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.weeklyCalories}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="calories" stroke="#2563eb" fill="#2563eb33" name="Calories" />
                    <Area type="monotone" dataKey="target" stroke="#22c55e" fill="transparent" strokeDasharray="4 4" name="Target" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <Card className="glass p-4">
            <CardHeader>
              <CardTitle>Log Today's Meal</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-3">
              <Input placeholder="Meal name" value={mealName} onChange={(e) => setMealName(e.target.value)} className="max-w-xs" />
              <Input placeholder="Calories" type="number" value={mealCalories} onChange={(e) => setMealCalories(e.target.value)} className="max-w-[120px]" />
              <Button onClick={logMeal}>Add Meal</Button>
            </div>
            {data?.todayLog?.meals && data.todayLog.meals.length > 0 && (
              <ul className="mt-4 space-y-2">
                {data.todayLog.meals.map((m, i) => (
                  <li key={i} className="flex justify-between rounded-lg bg-white/40 px-3 py-2 text-sm dark:bg-white/5">
                    <span>{m.name}</span>
                    <span className="font-medium">{m.calories} kcal</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={loadGrocery}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              AI Grocery List
            </Button>
          </div>

          {grocery.length > 0 && (
            <Card className="glass p-4">
              <CardHeader><CardTitle>Grocery Suggestions</CardTitle></CardHeader>
              <div className="grid gap-2 sm:grid-cols-2">
                {grocery.map((g, i) => (
                  <div key={i} className="rounded-lg border border-white/20 px-3 py-2 text-sm">
                    <span className="font-medium">{g.item}</span>
                    <span className="text-muted"> — {g.quantity} ({g.category})</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "planner" && (
        <div className="space-y-6">
          <Card className="glass p-4">
            <CardHeader><CardTitle>Generate AI Diet Plan</CardTitle></CardHeader>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
                {HEALTH_CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="hi">हिन्दी</option>
                <option value="ar">العربية</option>
              </Select>
              <Input placeholder="Weight (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <Input placeholder="Height (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <Button className="mt-4" onClick={generatePlan} disabled={generating}>
              {generating ? <LoadingSpinner size="sm" /> : "Generate Weekly Plan"}
            </Button>
          </Card>

          {data?.plan?.meals && data.plan.meals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {data.plan.meals.map((day, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>{day.day}</CardTitle>
                      <p className="text-xs text-muted">Target: {data.plan!.dailyCalorieTarget} kcal/day</p>
                    </CardHeader>
                    <div className="space-y-2 px-6 pb-4 text-sm">
                      <p><span className="font-medium text-primary">Breakfast:</span> {day.breakfast}</p>
                      <p><span className="font-medium text-secondary">Lunch:</span> {day.lunch}</p>
                      <p><span className="font-medium text-accent">Dinner:</span> {day.dinner}</p>
                      {day.snacks && <p><span className="font-medium">Snacks:</span> {day.snacks}</p>}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="glass p-8 text-center text-muted">
              No diet plan yet. Generate one above based on your health condition.
            </Card>
          )}
        </div>
      )}

      {tab === "bmi" && (
        <Card className="glass max-w-md p-6">
          <CardHeader><CardTitle>BMI Calculator</CardTitle></CardHeader>
          <div className="space-y-4">
            <Input placeholder="Weight (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <Input placeholder="Height (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
            <Button onClick={calcBmi} className="w-full">Calculate & Save</Button>
            {data?.bmi && (
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-4 text-center">
                <p className="text-4xl font-bold text-primary">{data.bmi.bmi}</p>
                <p className="text-muted">{data.bmi.category}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {tab === "water" && (
        <Card className="glass max-w-md p-6">
          <CardHeader><CardTitle>Water Intake Tracker</CardTitle></CardHeader>
          <div className="text-center">
            <p className="text-5xl font-bold text-secondary">{data?.water.glasses ?? 0}</p>
            <p className="text-muted">of {data?.water.targetGlasses ?? 8} glasses today</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => updateWater(Math.max(0, (data?.water.glasses ?? 0) - 1))}>-</Button>
              <Button onClick={() => updateWater((data?.water.glasses ?? 0) + 1)}>+ Add Glass</Button>
            </div>
          </div>
        </Card>
      )}

      {tab === "fasting" && (
        <Card className="glass max-w-md p-6">
          <CardHeader><CardTitle>Smart Fasting Tracker</CardTitle></CardHeader>
          {data?.activeFast ? (
            <div className="space-y-4 text-center">
              <p className="text-muted">Fasting in progress since</p>
              <p className="text-lg font-semibold">{new Date(data.activeFast.startTime).toLocaleString()}</p>
              <p className="text-sm">Target: {data.activeFast.targetHours} hours</p>
              <Button variant="danger" onClick={endFast}>End Fast</Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-muted">Start a 16:8 intermittent fast</p>
              <Button onClick={startFast}>Start Fasting</Button>
            </div>
          )}
        </Card>
      )}

      {tab === "chat" && (
        <Card className="glass flex h-[480px] flex-col">
          <CardHeader><CardTitle>Nutrition Chatbot</CardTitle></CardHeader>
          <div className="flex-1 space-y-3 overflow-y-auto px-6">
            {chatMessages.length === 0 && (
              <p className="text-center text-sm text-muted">Ask about meals, calories, or condition-specific nutrition.</p>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={cn("rounded-xl px-4 py-2 text-sm max-w-[85%]", m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-white/50 dark:bg-white/10")}>
                {m.content}
              </div>
            ))}
            {chatLoading && <LoadingSpinner size="sm" />}
          </div>
          <div className="flex gap-2 border-t border-white/20 p-4">
            <Input placeholder="Ask about nutrition..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} />
            <Button onClick={sendChat}>Send</Button>
          </div>
        </Card>
      )}
    </FeaturePageShell>
  );
}
