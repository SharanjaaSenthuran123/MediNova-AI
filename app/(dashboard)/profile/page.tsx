import { PageHeader } from "@/components/ui/PageHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { ProfileClient } from "@/features/profile/ProfileClient";
import { fetchCurrentUser } from "@/lib/api/user-api";
import { cookies } from "next/headers";

export default async function ProfilePage() {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const initialUser = await fetchCurrentUser(cookieHeader);

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage your MediNova account, medical data, and emergency contacts."
      />

      <DisclaimerBanner>
        Profile data is stored securely in MongoDB. Keep your emergency contacts up to date for SOS alerts.
      </DisclaimerBanner>

      <ProfileClient initialUser={initialUser} />
    </>
  );
}
