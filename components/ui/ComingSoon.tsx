import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface ComingSoonProps {
  label?: string;
  className?: string;
}

/** Small badge for features not yet built — honest hackathon labeling. */
export function ComingSoon({ label = "Coming soon", className }: ComingSoonProps) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 text-[10px] uppercase tracking-wide", className)}
    >
      <Clock className="h-3 w-3" aria-hidden />
      {label}
    </Badge>
  );
}
