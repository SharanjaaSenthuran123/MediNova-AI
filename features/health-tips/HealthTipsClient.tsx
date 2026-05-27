"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Droplets,
  Heart,
  Lightbulb,
  Moon,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DemoModeBanner } from "@/components/ui/DemoModeBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { TypingText } from "@/components/ui/TypingText";
import type { HealthTip, HealthTipCategory } from "@/lib/health-tips-fallback";

const CATEGORY_ICONS: Record<HealthTipCategory, typeof Droplets> = {
  hydration: Droplets,
  sleep: Moon,
  exercise: Dumbbell,
  wellness: Heart,
  nutrition: Lightbulb,
};

const CATEGORY_COLORS: Record<HealthTipCategory, string> = {
  hydration: "text-accent border-accent/30 bg-accent/10",
  sleep: "text-secondary border-secondary/30 bg-secondary/10",
  exercise: "text-success border-success/30 bg-success/10",
  wellness: "text-primary border-primary/30 bg-primary/10",
  nutrition: "text-warning border-warning/30 bg-warning/10",
};

interface TipsResponse {
  tips: HealthTip[];
  dailyInsight: string;
  disclaimer: string;
  demoMode?: boolean;
}

export function HealthTipsClient() {
  const [data, setData] = useState<TipsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchTips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health-tips");
      if (!res.ok) throw new Error("Failed to load tips");
      const json = (await res.json()) as TipsResponse;
      setData(json);
      setActiveIndex(0);
    } catch {
      setError("Could not load health tips. Showing cached demo content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTips();
    const rotate = setInterval(() => {
      setActiveIndex((i) => (data?.tips?.length ? (i + 1) % data.tips.length : 0));
    }, 8000);
    return () => clearInterval(rotate);
  }, [fetchTips, data?.tips?.length]);

  if (loading && !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    );
  }

  const tips = data?.tips ?? [];
  const featured = tips[activeIndex];

  return (
    <div className="space-y-6">
      {data?.demoMode && (
        <DemoModeBanner message="Add OPENAI_API_KEY or GEMINI_API_KEY for live AI wellness tips." />
      )}

      {error && (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <Card variant="gradient" className="border-primary/25 shadow-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            Daily Health Insight
          </CardTitle>
          <CardDescription>Refreshed with AI or smart demo fallbacks</CardDescription>
        </CardHeader>
        <p className="text-sm leading-relaxed text-muted">
          {data?.dailyInsight ? (
            <TypingText text={data.dailyInsight} speed={14} />
          ) : (
            "Loading insight…"
          )}
        </p>
      </Card>

      {tips.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No tips available"
          description="Try refreshing to load wellness suggestions."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {tips.map((tip, index) => {
            const Icon = CATEGORY_ICONS[tip.category] ?? Lightbulb;
            const colorClass = CATEGORY_COLORS[tip.category] ?? CATEGORY_COLORS.wellness;
            const isFeatured = index === activeIndex;

            return (
              <motion.li
                key={tip.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card
                  variant={isFeatured ? "gradient" : "glass"}
                  className={`h-full transition-all duration-500 ${
                    isFeatured ? "border-primary/30 shadow-glow scale-[1.01]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <Badge variant="outline">{tip.badge}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{tip.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{tip.body}</p>
                </Card>
              </motion.li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => void fetchTips()}>
          <RefreshCw className="h-4 w-4" />
          Refresh tips
        </Button>
        {featured && (
          <p className="text-xs text-muted">
            Featured: {featured.badge} · rotates every 8s
          </p>
        )}
      </div>

      {data?.disclaimer && (
        <p className="text-xs text-muted">{data.disclaimer}</p>
      )}
    </div>
  );
}
