import { Suspense } from "react";
import { AuthPage } from "@/features/auth/components/AuthPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthPage />
    </Suspense>
  );
}