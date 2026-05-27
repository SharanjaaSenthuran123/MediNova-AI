import Link from "next/link";
import {
  Bell,
  Calendar,
  MessageSquare,
  Mic,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { futureFeatures } from "@/data/futureFeatures";

const iconMap: Record<string, LucideIcon> = {
  MessageSquare,
  Calendar,
  Bell,
  Watch,
  Mic,
};

export function RoadmapSection() {
  return (
    <section id="roadmap" className="border-t border-white/20 py-20 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          title="Product roadmap"
          description="Phase 12 integrations are live in this demo. Voice assistant and real IoT hooks remain on the horizon — see the full vision in the repo docs."
          className="mb-12 [&_h2]:text-3xl [&_h2]:font-bold"
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {futureFeatures.map((feature) => {
            const Icon = iconMap[feature.icon] ?? MessageSquare;
            const card = (
              <Card
                className={`h-full ${feature.live ? "" : "opacity-90"}`}
                interactive={Boolean(feature.href)}
              >
                <section className="flex items-start justify-between gap-2">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      feature.live
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/50 text-muted"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  {feature.live ? (
                    <Badge variant="success">Live</Badge>
                  ) : (
                    <ComingSoon />
                  )}
                </section>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted">
                  {feature.live ? "Try it in the app" : `Target: ${feature.timeline}`}
                </p>
              </Card>
            );

            return (
              <li key={feature.title}>
                {feature.href ? (
                  <Link href={feature.href} className="block h-full">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </li>
            );
          })}
        </ul>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted">
          See{" "}
          <code className="rounded bg-muted/50 px-1.5 py-0.5 text-xs">
            docs/INTEGRATIONS.md
          </code>{" "}
          and{" "}
          <code className="rounded bg-muted/50 px-1.5 py-0.5 text-xs">
            docs/FUTURE-ROADMAP.md
          </code>{" "}
          for API reference and Phase 13 vision.
        </p>
      </div>
    </section>
  );
}
