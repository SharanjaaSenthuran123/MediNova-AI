import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset password"
      subtitle="Choose a strong new password for your account"
    >
      <Suspense fallback={<LoadingSpinner className="py-8" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
