import { Suspense } from "react";

import { PageSpinner } from "@/components/ui/page-spinner";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<PageSpinner iconClassName="text-white/60" />}>
      <LoginForm />
    </Suspense>
  );
}
