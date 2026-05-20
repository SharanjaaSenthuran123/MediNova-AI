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
}

export function HealthChart({
  title,
  description,
  labels,
  values,
  type = "line",
  unit = "",
  color = "#14b8a6",
}: HealthChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(100, 116, 139, 0.15)";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        borderColor: color,
        backgroundColor:
          type === "line" ? `${color}33` : `${color}99`,
        fill: type === "line",
        tension: 0.35,
        borderRadius: type === "bar" ? 8 : 0,
      },
    ],
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) =>
            `${ctx.parsed.y ?? ""}${unit ? ` ${unit}` : ""}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <div className="h-56 px-2 pb-2">
        {mounted ? (
          type === "line" ? (
            <Line data={data} options={lineOptions} />
          ) : (
            <Bar data={data} options={barOptions} />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Loading chart...
          </div>
        )}
      </div>
    </Card>
  );
}
