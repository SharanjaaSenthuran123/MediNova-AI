import { DoctorsClient } from "@/features/doctors/DoctorsClient";
import { PageHeader } from "@/components/ui/PageHeader";

export default function DoctorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Clinical Network"
        title="Doctor Management"
        description="Browse specialists, check availability, ratings, and schedules."
      />
      <DoctorsClient />
    </>
  );
}
