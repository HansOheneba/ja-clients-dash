import { AdvisorPageHeader, advisorSurface } from "@/components/advisors/advisor-surface";
import { AdvisorSettingsForm } from "@/components/advisors/advisor-settings-form";
import { PageShell } from "@/components/layout/page-shell";
import { Muted } from "@/components/ui/typography";
import { getAdvisorById } from "@/lib/wealth/queries";
import { requireAdvisor } from "@/lib/wealth/session";

export default async function AdvisorSettingsPage() {
  const session = await requireAdvisor();
  const advisor = session.profile.advisor_id
    ? await getAdvisorById(session.profile.advisor_id)
    : null;

  return (
    <PageShell className={advisorSurface.pageGap}>
      <AdvisorPageHeader
        title="Settings"
        description="Correct your name or the hours clients can request a session."
      />

      {advisor ? (
        <AdvisorSettingsForm
          fullName={advisor.full_name}
          email={session.email}
          timezone={advisor.timezone}
          availabilityNotes={advisor.availability_notes}
          notifySessions={advisor.notify_sessions}
          notifyDocuments={advisor.notify_documents}
          notifyMessages={advisor.notify_messages}
        />
      ) : (
        <Muted>No wealth manager profile is linked to this account yet.</Muted>
      )}
    </PageShell>
  );
}
