import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function EmergencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
