"use client";

import { ClientMessagesView } from "@/components/clients/client-messages-view";
import { PageShell } from "@/components/layout/page-shell";
import { ClientEmptyState } from "@/components/ui/empty-state";
import {
  DashCard,
  DashCardContent,
} from "@/components/ui/dash-card";
import { H1, Muted } from "@/components/ui/typography";

export function ClientMessagesPageClient({
  clientId,
}: {
  clientId: string | null;
}) {
  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Messages</H1>
        <Muted>Secure messaging with your wealth manager</Muted>
      </header>
      {clientId ? (
        <ClientMessagesView clientId={clientId} />
      ) : (
        <DashCard>
          <DashCardContent>
            <ClientEmptyState
              variant="messages"
              title="Messages unavailable"
              description="We could not load your client record. Try signing out and back in, or contact your wealth manager."
            />
          </DashCardContent>
        </DashCard>
      )}
    </PageShell>
  );
}
