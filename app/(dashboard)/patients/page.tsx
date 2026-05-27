import { PatientsClient } from "@/features/patients/PatientsClient";
import { PageHeader } from "@/components/ui/PageHeader";

export default function PatientsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Care Management"
        title="Patient Management"
        description="Track medical history, health reports, and disease progression."
      />
      <PatientsClient />
    </>
  );
}
