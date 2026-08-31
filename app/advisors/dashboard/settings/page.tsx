import { PageShell } from "@/components/layout/page-shell";
import { AdvisorSettingsForm } from "@/components/advisors/advisor-settings-form";
import { H1, Muted } from "@/components/ui/typography";
import { getAdvisorById } from "@/lib/wealth/queries";
import { requireAdvisor } from "@/lib/wealth/session";

export default async function AdvisorSettingsPage() {
  const session = await requireAdvisor();
  const advisor = session.profile.advisor_id
    ? await getAdvisorById(session.profile.advisor_id)
    : null;

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Settings</H1>
        <Muted>Correct your name or the hours clients can request a session.</Muted>
      </header>

      {advisor ? (
        <AdvisorSettingsForm
          fullName={advisor.full_name}
          email={session.email}
          timezone={advisor.timezone}
          availabilityNotes={advisor.availability_notes}
        />
      ) : (
        <Muted>No wealth manager profile is linked to this account yet.</Muted>
      )}
    </PageShell>
  );
}
