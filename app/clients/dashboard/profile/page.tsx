import { PageShell } from "@/components/layout/page-shell";
import { RequestSessionForm } from "@/components/clients/request-session-form";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { requireUser } from "@/lib/wealth/session";
import {
  getAdvisorById,
  getClientAddress,
  getClientById,
} from "@/lib/wealth/queries";
import { formatAvailabilityNotes } from "@/lib/wealth/availability";
import { formatTimezoneLabel } from "@/lib/wealth/timezones";
import { formatCountryName, formatRegionName } from "@/lib/wealth/countries";
import { redirect } from "next/navigation";
import Link from "next/link";

function initialsFrom(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <Muted className="shrink-0">{label}</Muted>
      <TextSmall className="text-right font-medium">{value}</TextSmall>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await requireUser();
  if (session.profile.role !== "client" || !session.profile.client_id) {
    redirect(
      session.profile.role === "advisor" || session.profile.role === "admin"
        ? "/advisors/dashboard"
        : "/clients/dashboard",
    );
  }

  const client = await getClientById(session.profile.client_id);
  if (!client) redirect("/clients/dashboard");

  const [address, advisor] = await Promise.all([
    getClientAddress(client.id),
    client.advisor_id ? getAdvisorById(client.advisor_id) : Promise.resolve(null),
  ]);

  const location = address
    ? [
        address.line1,
        address.city,
        formatRegionName(address.country, address.region),
        address.postal_code,
        formatCountryName(address.country),
      ]
        .filter(Boolean)
        .join(", ")
    : "Not recorded";

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-16">
          <AvatarFallback className="bg-brand-primary text-lg font-semibold text-white">
            {initialsFrom(client.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <H1>{client.full_name}</H1>
          <Muted>
            Client {client.client_number}
            {client.inception_date ? ` · Since ${formatDate(client.inception_date)}` : ""}
            {advisor ? ` · Advisor: ${advisor.full_name}` : ""}
          </Muted>
        </div>
      </header>

      <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-2.5">
        <Muted className="text-amber-800">
          Your advisor maintains this record. Ask them if anything here needs updating.
        </Muted>
      </div>

      <div className="grid grid-cols-1 gap-(--spacing-grid) lg:grid-cols-2">
        <DashCard>
          <DashCardHeader>
            <DashCardTitle>Personal information</DashCardTitle>
          </DashCardHeader>
          <DashCardContent>
            <dl className="flex flex-col gap-3">
              <Row label="Full name" value={client.full_name} />
              <Row label="Email" value={client.email} />
              <Row label="Phone" value={client.phone || "Not recorded"} />
              <Row label="Date of birth" value={formatDate(client.date_of_birth)} />
              <Row label="Address" value={location} />
            </dl>
          </DashCardContent>
        </DashCard>

        <DashCard>
          <DashCardHeader>
            <DashCardTitle>Household</DashCardTitle>
          </DashCardHeader>
          <DashCardContent>
            <dl className="flex flex-col gap-3">
              <Row label="Marital status" value={client.marital_status || "Not recorded"} />
              <Row
                label="Dependents"
                value={String(client.dependents ?? 0)}
              />
              <Row label="Estate planning" value={client.estate_status || "Not recorded"} />
            </dl>
          </DashCardContent>
        </DashCard>

        <DashCard>
          <DashCardHeader>
            <div>
              <DashCardTitle>Investment profile</DashCardTitle>
              <DashCardDescription>How your advisor has recorded your mandate</DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent>
            <dl className="flex flex-col gap-3">
              <Row label="Risk profile" value={client.risk_profile || "Not recorded"} />
              <Row
                label="Investment horizon"
                value={client.investment_horizon || "Not recorded"}
              />
              <Row
                label="Primary objective"
                value={client.primary_objective || "Not recorded"}
              />
              <Row label="Currency" value={client.currency} />
            </dl>
          </DashCardContent>
        </DashCard>

        <DashCard>
          <DashCardHeader>
            <div>
              <DashCardTitle>Planning notes</DashCardTitle>
              <DashCardDescription>
                A short note from your wealth manager. Named goals with amounts and dates are on{" "}
                <Link href="/clients/dashboard/goals" className="underline underline-offset-2">
                  My Goals
                </Link>
                .
              </DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent>
            <TextSmall className="whitespace-pre-wrap">
              {client.financial_goals || "Your advisor has not added a note yet."}
            </TextSmall>
          </DashCardContent>
        </DashCard>

        {advisor ? (
          <DashCard className="lg:col-span-2">
            <DashCardHeader>
              <div>
                <DashCardTitle>Your wealth manager</DashCardTitle>
                <DashCardDescription>
                  {advisor.full_name}
                  {advisor.title ? ` · ${advisor.title}` : ""}
                </DashCardDescription>
              </div>
            </DashCardHeader>
            <DashCardContent className="flex flex-col gap-4">
              {advisor.bio ? (
                <TextSmall className="leading-relaxed text-muted-foreground">
                  {advisor.bio}
                </TextSmall>
              ) : (
                <Muted>Your wealth manager will add a short introduction soon.</Muted>
              )}
              {advisor.phone ? (
                <Row label="Phone" value={advisor.phone} />
              ) : null}
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
              <RequestSessionForm advisorName={advisor.full_name} />
            </DashCardContent>
          </DashCard>
        ) : null}
      </div>
    </PageShell>
  );
}
