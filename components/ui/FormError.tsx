import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  return (
    <p
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-xl glass border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger backdrop-blur-md",
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}
