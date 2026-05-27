import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoModeBannerProps {
  message?: string;
  className?: string;
}

export function DemoModeBanner({
  message = "Demo mode — add OPENAI_API_KEY to .env.local for live AI Symptom Checker results.",
  className,
}: DemoModeBannerProps) {
  return (
    <div
      className={cn(
        "mb-6 flex items-start gap-2 rounded-xl glass border-secondary/30 bg-gradient-to-r from-secondary/10 to-accent/5 px-4 py-3 text-sm text-muted backdrop-blur-md",
        className
      )}
      role="status"
    >
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
      <p>{message}</p>
    </div>
  );
}
