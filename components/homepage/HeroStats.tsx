"use client";

import { AnimatedCounter } from "@/components/homepage/AnimatedCounter";
import { heroStats } from "@/data/homepageFeatures";

export function HeroStats() {
  return (
    <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {heroStats.map((stat) => (
        <li
          key={stat.label}
          className="glass rounded-xl px-4 py-3 text-center transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-glow"
        >
          <p className="text-2xl font-bold text-gradient sm:text-3xl">
            <AnimatedCounter
              end={stat.value}
              suffix={stat.suffix}
              prefix={stat.prefix}
            />
          </p>
          <p className="mt-1 text-xs text-muted">{stat.label}</p>
        </li>
      ))}
    </ul>
  );
}
