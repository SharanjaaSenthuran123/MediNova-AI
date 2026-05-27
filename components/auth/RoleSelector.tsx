"use client";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: "patient", label: "Patient", description: "Orders & health" },
  { value: "doctor", label: "Doctor", description: "Clinical tools" },
  { value: "pharmacy", label: "Pharmacy", description: "Inventory & orders" },
  { value: "donor", label: "Donor", description: "Blood network" },
  { value: "admin", label: "Admin", description: "Control panel" },
];

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  className?: string;
}

export function RoleSelector({ value, onChange, className }: RoleSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5", className)}>
      {roles.map((role) => (
        <button
          key={role.value}
          type="button"
          onClick={() => onChange(role.value)}
          className={cn(
            "rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
            value === role.value
              ? "border-primary/50 bg-primary/10 shadow-glow"
              : "border-border/60 glass hover:border-primary/30"
          )}
        >
          <span className="block text-sm font-semibold text-foreground">{role.label}</span>
          <span className="block text-xs text-muted">{role.description}</span>
        </button>
      ))}
    </div>
  );
}
