import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OtpVerificationForm } from "@/components/auth/OtpVerificationForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function VerifyOtpPage() {
  return (
    <AuthLayout
      title="Verify your identity"
      subtitle="Enter the OTP sent to your email"
    >
      <Suspense fallback={<LoadingSpinner className="py-8" />}>
        <OtpVerificationForm />
      </Suspense>
    </AuthLayout>
  );
}
