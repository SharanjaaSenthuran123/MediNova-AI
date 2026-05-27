import { SettingsClient } from "@/features/settings/SettingsClient";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Manage security, notifications, and application preferences."
      />
      <SettingsClient />
    </>
  );
}
