import Link from "next/link";

import { Suspense } from "react";

import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";

import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

import { Button } from "@/components/ui/Button";

import { LoadingState } from "@/components/ui/LoadingState";

import { ReportsClient } from "@/features/reports/ReportsClient";



export default function ReportsPage() {

  return (

    <>

      <PageHeader

        eyebrow="Records"

        title="Health Reports"

        description="Search and filter health reports generated from symptom checks, OCR scans, barcode lookups, and dashboard analytics."

        action={

          <Link href="/dashboard">

            <Button variant="outline" size="sm">

              <ArrowLeft className="h-4 w-4" />

              Back to Dashboard

            </Button>

          </Link>

        }

      />



      <DisclaimerBanner>
        Reports combine AI-generated records from your activity with sample lab data for
        demo presentations — not connected to a real EHR system.
      </DisclaimerBanner>



      <Suspense fallback={<LoadingState label="Loading reports…" className="min-h-[320px]" />}>

        <ReportsClient />

      </Suspense>

    </>

  );

}


