"use client";

import { ProposeSessionForm } from "@/components/sessions/propose-session-form";

export function RequestSessionForm({
  advisorName,
  onSuccess,
}: {
  advisorName: string;
  onSuccess?: () => void;
}) {
  return (
    <ProposeSessionForm
      submitLabel="Request session"
      successMessage={`Your session proposal was sent to ${advisorName}. It will be confirmed once you both agree on the time.`}
      onSuccess={onSuccess}
    />
  );
}
