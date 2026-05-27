"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { motion } from "framer-motion";
import { Line, Bar } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartKind = "line" | "bar";

interface HealthChartProps {
  title: string;
  description?: string;
  labels: string[];
  values: number[];
  type?: ChartKind;
  unit?: string;
  color?: string;
  delay?: number;
  /** Change this key to re-trigger chart animation on live data updates */
  liveKey?: string;
}

export function HealthChart({
  title,
  description,
  labels,
  values,
  type = "line",
  unit = "",
  color = "#14b8a6",
  delay = 0,
  liveKey,
}: HealthChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (liveKey) setChartKey((k) => k + 1);
  }, [liveKey]);

  const isDark = mounted && resolvedTheme === "dark";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(100, 116, 139, 0.12)";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        borderColor: color,
        backgroundColor: type === "line" ? `${color}40` : `${color}99`,
        fill: type === "line",
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        borderRadius: type === "bar" ? 10 : 0,
      },
    ],
  };

  const animation = {
    duration: 1400,
    easing: "easeOutQuart" as const,
    delay: (ctx: { type: string; dataIndex: number }) =>
      ctx.type === "data" ? ctx.dataIndex * 80 : 0,
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)",
        titleColor: isDark ? "#f1f5f9" : "#0f172a",
        bodyColor: isDark ? "#94a3b8" : "#64748b",
        borderColor: isDark ? "rgba(148,163,184,0.2)" : "rgba(226,232,240,0.8)",
        borderWidth: 1,
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) =>
            `${ctx.parsed.y ?? ""}${unit ? ` ${unit}` : ""}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor },
        beginAtZero: type === "bar",
      },
    },
  };

  const lineOptions = baseOptions as ChartOptions<"line">;
  const barOptions = baseOptions as ChartOptions<"bar">;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        variant="elevated"
        className="overflow-hidden border-primary/10 hover:shadow-glow transition-shadow duration-500"
      >
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <div className="chart-enter h-56 px-2 pb-2">
          {mounted ? (
            type === "line" ? (
              <Line key={chartKey} data={data} options={lineOptions} />
            ) : (
              <Bar key={chartKey} data={data} options={barOptions} />
            )
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
