import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function SymptomCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
