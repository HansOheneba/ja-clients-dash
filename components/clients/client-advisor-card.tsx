import Link from "next/link";

import { RequestSessionForm } from "@/components/clients/request-session-form";
import { ClientEmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Muted, TextSmall } from "@/components/ui/typography";
import { formatAvailabilityNotes } from "@/lib/wealth/availability";
import { formatTimezoneLabel } from "@/lib/wealth/timezones";
import type { WealthAdvisor } from "@/lib/wealth/types";
import { cn } from "@/lib/utils";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <Muted className="shrink-0">{label}</Muted>
      <TextSmall className="text-right font-medium">{value}</TextSmall>
    </div>
  );
}

export function ClientAdvisorCard({
  advisor,
}: {
  advisor: WealthAdvisor | null;
}) {
  if (!advisor) {
    return (
      <DashCard>
        <DashCardContent>
          <ClientEmptyState
            variant="messages"
            title="No wealth manager assigned yet"
            description="Your account is being set up. Someone from JA Wealth will assign your wealth manager shortly."
          />
        </DashCardContent>
      </DashCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashCard>
        <DashCardHeader>
          <div>
            <DashCardTitle>{advisor.full_name}</DashCardTitle>
            <DashCardDescription>
              {advisor.title ? advisor.title : "Your wealth manager"}
            </DashCardDescription>
          </div>
        </DashCardHeader>
        <DashCardContent className="flex flex-col gap-4">
          {advisor.bio ? (
            <TextSmall className="leading-relaxed text-muted-foreground">{advisor.bio}</TextSmall>
          ) : (
            <Muted>Your wealth manager will add a short introduction soon.</Muted>
          )}
          {advisor.email ? <Row label="Email" value={advisor.email} /> : null}
          {advisor.phone ? <Row label="Phone" value={advisor.phone} /> : null}
          {advisor.timezone ? (
            <Row label="Timezone" value={formatTimezoneLabel(advisor.timezone)} />
          ) : null}
          {advisor.availability_notes ? (
            <div className="flex flex-col gap-1">
              <Muted>Availability for sessions</Muted>
              <TextSmall className="whitespace-pre-wrap">
                {formatAvailabilityNotes(advisor.availability_notes)}
              </TextSmall>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/clients/dashboard/sessions"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Request a session
            </Link>
            <Link
              href="/clients/dashboard/messages"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Send a message
            </Link>
          </div>
        </DashCardContent>
      </DashCard>

      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Quick session request</DashCardTitle>
          <DashCardDescription>
            Prefer a form? Send {advisor.full_name.split(" ")[0]} your topic and availability.
          </DashCardDescription>
        </DashCardHeader>
        <DashCardContent>
          <RequestSessionForm advisorName={advisor.full_name} />
        </DashCardContent>
      </DashCard>
    </div>
  );
}
