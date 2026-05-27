"use client";

import { useState } from "react";
import { Bell, Lock, Moon, Shield, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Input label="Current password" type="password" />
          <Input label="New password" type="password" />
          <Input label="Confirm new password" type="password" />
          <Button variant="outline" size="sm">
            <Lock className="h-4 w-4" />
            Update password
          </Button>
        </div>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Select label="Appointment reminders">
            <option>15 minutes before</option>
            <option>30 minutes before</option>
            <option>1 hour before</option>
          </Select>
          <Select label="Medicine reminders">
            <option>Enabled</option>
            <option>Disabled</option>
          </Select>
          <Select label="Emergency alerts">
            <option>Push + SMS</option>
            <option>Push only</option>
          </Select>
        </div>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            Appearance
          </CardTitle>
        </CardHeader>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t ? "primary" : "outline"}
              size="sm"
              onClick={() => setTheme(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Select label="Language">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </Select>
          <Select label="Timezone">
            <option>UTC-5 (Eastern)</option>
            <option>UTC-8 (Pacific)</option>
          </Select>
          <Button onClick={handleSave}>
            {saved ? "Saved!" : "Save preferences"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
