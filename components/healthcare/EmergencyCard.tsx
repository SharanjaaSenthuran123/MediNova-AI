import { CheckCircle2, Loader2, Mail, Phone, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { EmergencyContact, NotifiedContact } from "@/types/emergency";
import { cn } from "@/lib/utils";

interface EmergencyCardProps {
  contact: EmergencyContact;
  notified?: NotifiedContact[];
  /** Step is actively notifying this contact */
  notifying?: boolean;
  /** Highlight during dispatch simulation */
  dispatching?: boolean;
}

export function EmergencyCard({
  contact,
  notified = [],
  notifying = false,
  dispatching = false,
}: EmergencyCardProps) {
  const contactNotifications = notified.filter((n) => n.name === contact.name);
  const wasNotified = contactNotifications.length > 0;
  const isActive = notifying || dispatching;

  return (
    <Card
      className={cn(
        "transition-all duration-500",
        wasNotified && "contact-notify-flash border-success/40 bg-success/5",
        isActive && !wasNotified && "border-danger/40 bg-danger/5 ring-2 ring-danger/20",
        dispatching && !wasNotified && "animate-pulse"
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
            wasNotified
              ? "bg-success/15 text-success"
              : isActive
                ? "bg-danger/15 text-danger"
                : "bg-danger/10 text-danger"
          )}
        >
          {notifying ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{contact.name}</p>
            {wasNotified && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Notified
              </Badge>
            )}
            {notifying && !wasNotified && (
              <Badge variant="danger" className="gap-1 animate-pulse">
                Alerting…
              </Badge>
            )}
            {dispatching && !wasNotified && (
              <Badge variant="warning" className="gap-1">
                Dispatch sim…
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted">{contact.relation}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="flex items-center gap-2 text-muted">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {contact.phone}
            </p>
            {contact.email && (
              <p className="flex items-center gap-2 text-muted">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {contact.email}
              </p>
            )}
          </div>
          {contactNotifications.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {contactNotifications.map((n, i) => (
                <Badge key={`${n.channel}-${i}`} variant="outline" className="text-xs capitalize">
                  {n.channel}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
