import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { Button } from "@/components/ui/Button";
import { NearbyClient } from "@/features/nearby/NearbyClient";

export default function NearbyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Location"
        title="Nearby Healthcare"
        description="Find hospitals, pharmacies, and clinics near you using browser geolocation and OpenStreetMap."
        action={
          <Link href="/emergency">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Emergency SOS
            </Button>
          </Link>
        }
      />

      <DisclaimerBanner>
        Facility data from OpenStreetMap — verify hours and services before visiting.
        Allow location access and tap Set current location for facilities near you.
      </DisclaimerBanner>

      <NearbyClient />
    </>
  );
}
