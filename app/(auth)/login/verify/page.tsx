import { Suspense } from "react";

import { PageSpinner } from "@/components/ui/page-spinner";
import VerifyPageClient from "./verify-client";

export default function VerifyPage() {
  return (
    <Suspense fallback={<PageSpinner iconClassName="text-white/60" />}>
      <VerifyPageClient />
    </Suspense>
  );
}
