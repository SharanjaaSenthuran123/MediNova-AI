import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { futureFeatures } from "@/data/futureFeatures";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Compact roadmap teaser — full grid lives on /roadmap. */
export function RoadmapTeaserSection() {
  const preview = futureFeatures.slice(0, 3);

  return (
    <section id="roadmap" className="border-t border-white/20 py-16 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          title="Product roadmap"
          description="Assistant, appointments, reminders, and wearables are live in this demo build."
          className="mb-8 [&_h2]:text-2xl [&_h2]:font-bold"
        />
        <ul className="grid gap-4 sm:grid-cols-3">
          {preview.map((feature) => (
            <li key={feature.title}>
              <Card padding="sm" className="h-full">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={feature.live ? "success" : "outline"}>
                    {feature.live ? "Live" : "Soon"}
                  </Badge>
                </div>
                <h3 className="mt-3 font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {feature.description}
                </p>
              </Card>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <ButtonLink href="/roadmap" variant="outline">
            View full roadmap
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
