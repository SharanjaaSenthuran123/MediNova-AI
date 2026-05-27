"use client";

import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const appointments = [
  { id: "1", time: "9:00 AM", title: "Dr. Priya Nair — Checkup", type: "In-person" },
  { id: "2", time: "2:30 PM", title: "Lab Results Review", type: "Follow-up" },
  { id: "3", time: "4:00 PM", title: "Physical Therapy", type: "In-person" },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = 3;

export function AppointmentCalendarCard() {
  return (
    <Card variant="elevated">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-primary" />
          Appointment Calendar
        </CardTitle>
        <Link
          href="/appointments"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <div className="mb-4 grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div
            key={day}
            className={
              i === today
                ? "rounded-lg bg-primary py-2 text-center text-xs font-semibold text-primary-foreground"
                : "rounded-lg glass py-2 text-center text-xs text-muted"
            }
          >
            {day}
            <span className="mt-0.5 block text-[10px] opacity-70">
              {19 + i}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="flex items-center gap-3 rounded-xl glass px-3 py-2.5 transition-colors hover:bg-primary/5"
          >
            <span className="text-xs font-semibold text-primary">{apt.time}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{apt.title}</p>
            </div>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {apt.type}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
