"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  aiRiskMetrics as baseAiRisk,
  healthStats as baseHealthStats,
  hydrationMetrics as baseHydration,
  sleepQuality as baseSleep,
} from "@/data/dashboardStats";
import {
  heartRateWeek as baseHeartRate,
  medicineAdherence as baseAdherence,
  sleepWeek as baseSleepWeek,
} from "@/data/chartData";
import type {
  AIRiskMetrics,
  HealthStat,
  HydrationMetrics,
  SleepQualityMetrics,
} from "@/types/health";

const UPDATE_INTERVAL_MS = 4000;

interface ChartSeries {
  labels: string[];
  values: number[];
}

interface LiveChartData {
  heartRateWeek: ChartSeries;
  sleepWeek: ChartSeries;
  medicineAdherence: ChartSeries;
}

interface LiveHealthContextValue {
  healthStats: HealthStat[];
  sleepQuality: SleepQualityMetrics;
  hydration: HydrationMetrics;
  aiRisk: AIRiskMetrics;
  chartData: LiveChartData;
  lastUpdated: Date;
  isLive: boolean;
}

const LiveHealthContext = createContext<LiveHealthContextValue | null>(null);

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function jitter(value: number, amount: number, min: number, max: number): number {
  const delta = (Math.random() - 0.5) * 2 * amount;
  return clamp(parseFloat((value + delta).toFixed(1)), min, max);
}

function formatTimeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 10) return "Just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  return `${mins} min ago`;
}

function initStats(): HealthStat[] {
  return baseHealthStats.map((s) => ({ ...s }));
}

function initChart(): LiveChartData {
  return {
    heartRateWeek: {
      labels: [...baseHeartRate.labels],
      values: [...baseHeartRate.values],
    },
    sleepWeek: {
      labels: [...baseSleepWeek.labels],
      values: [...baseSleepWeek.values],
    },
    medicineAdherence: {
      labels: [...baseAdherence.labels],
      values: [...baseAdherence.values],
    },
  };
}

export function LiveHealthProvider({ children }: { children: ReactNode }) {
  const [healthStats, setHealthStats] = useState<HealthStat[]>(initStats);
  const [sleepQuality, setSleepQuality] = useState<SleepQualityMetrics>({
    ...baseSleep,
  });
  const [hydration, setHydration] = useState<HydrationMetrics>({
    ...baseHydration,
  });
  const [aiRisk, setAiRisk] = useState<AIRiskMetrics>({ ...baseAiRisk });
  const [chartData, setChartData] = useState<LiveChartData>(initChart);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  const tick = useCallback(() => {
    setHealthStats((prev) =>
      prev.map((stat) => {
        if (stat.id === "heart-rate") {
          const next = Math.round(jitter(stat.numericValue ?? 72, 3, 58, 98));
          return {
            ...stat,
            value: String(next),
            numericValue: next,
            change: `${next > (stat.numericValue ?? 72) ? "+" : ""}${next - (stat.numericValue ?? 72)} bpm · Live`,
          };
        }
        if (stat.id === "sleep") {
          const next = Math.round(jitter(stat.numericValue ?? 86, 2, 60, 98));
          return { ...stat, value: String(next), numericValue: next };
        }
        if (stat.id === "medicine") {
          const next = Math.round(jitter(stat.numericValue ?? 94, 1, 80, 100));
          return { ...stat, value: String(next), numericValue: next };
        }
        if (stat.id === "hydration") {
          const next = jitter(stat.numericValue ?? 1.8, 0.08, 0.8, 2.8);
          const glasses = Math.round((next / 0.25) * 0.25 * 4);
          return {
            ...stat,
            value: next.toFixed(1),
            numericValue: next,
            change: `${Math.min(8, Math.max(0, glasses))}/8 glasses today`,
          };
        }
        return stat;
      })
    );

    setSleepQuality((prev) => ({
      ...prev,
      score: Math.round(jitter(prev.score, 1.5, 65, 98)),
      deepSleepHours: jitter(prev.deepSleepHours, 0.1, 1, 2.5),
      remHours: jitter(prev.remHours, 0.1, 1.2, 2.8),
    }));

    setHydration((prev) => {
      const nextMl = Math.round(jitter(prev.currentMl, 40, 800, 2600));
      return {
        ...prev,
        currentMl: nextMl,
        glasses: Math.min(prev.goalGlasses, Math.round(nextMl / 300)),
      };
    });

    setAiRisk((prev) => ({
      ...prev,
      score: Math.round(jitter(prev.score, 2, 8, 45)),
      lastUpdated: formatTimeAgo(new Date()),
    }));

    setChartData((prev) => {
      const hrValues = [...prev.heartRateWeek.values];
      hrValues.shift();
      hrValues.push(Math.round(jitter(hrValues[hrValues.length - 1] ?? 72, 4, 58, 98)));

      const sleepValues = [...prev.sleepWeek.values];
      sleepValues.shift();
      sleepValues.push(jitter(sleepValues[sleepValues.length - 1] ?? 7.5, 0.4, 5, 9.5));

      const adValues = [...prev.medicineAdherence.values];
      adValues[adValues.length - 1] = Math.round(
        jitter(adValues[adValues.length - 1] ?? 94, 1, 82, 100)
      );

      return {
        heartRateWeek: { ...prev.heartRateWeek, values: hrValues },
        sleepWeek: { ...prev.sleepWeek, values: sleepValues },
        medicineAdherence: { ...prev.medicineAdherence, values: adValues },
      };
    });

    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    const id = setInterval(tick, UPDATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tick]);

  const value = useMemo<LiveHealthContextValue>(
    () => ({
      healthStats,
      sleepQuality,
      hydration,
      aiRisk,
      chartData,
      lastUpdated,
      isLive: true,
    }),
    [healthStats, sleepQuality, hydration, aiRisk, chartData, lastUpdated]
  );

  return (
    <LiveHealthContext.Provider value={value}>
      {children}
    </LiveHealthContext.Provider>
  );
}

export function useLiveHealth(): LiveHealthContextValue {
  const ctx = useContext(LiveHealthContext);
  if (!ctx) {
    return {
      healthStats: baseHealthStats,
      sleepQuality: baseSleep,
      hydration: baseHydration,
      aiRisk: baseAiRisk,
      chartData: {
        heartRateWeek: baseHeartRate,
        sleepWeek: baseSleepWeek,
        medicineAdherence: baseAdherence,
      },
      lastUpdated: new Date(),
      isLive: false,
    };
  }
  return ctx;
}
