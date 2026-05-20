import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function PrescriptionReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
