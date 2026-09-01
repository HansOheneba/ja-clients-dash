"use client";

import { useEffect, useState } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { ClientMessagesTab } from "@/components/advisors/client-messages-tab";
import { H1, Muted } from "@/components/ui/typography";

export default function ClientMessagesPage() {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setClientId(data.profile?.client_id ?? null))
      .catch(() => undefined);
  }, []);

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Messages</H1>
        <Muted>Secure messaging with your wealth manager</Muted>
      </header>
      {clientId ? (
        <ClientMessagesTab clientId={clientId} ownRole="client" />
      ) : (
        <Muted>Loading your conversation...</Muted>
      )}
    </PageShell>
  );
}
