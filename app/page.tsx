import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getAuthToken, getSessionUserId } from "@/lib/auth/session";

export default async function LoginPage() {
  const userId = await getSessionUserId();
  const token = await getAuthToken();

  if (userId && token) {
    redirect("/home");
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Smart Healthcare Ecosystem account"
    >
      <Suspense fallback={<LoadingSpinner className="mx-auto py-8" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
