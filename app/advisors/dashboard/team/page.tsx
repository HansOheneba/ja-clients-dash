import { TeamWorkspace } from "@/components/advisors/team-workspace";
import { PageShell } from "@/components/layout/page-shell";
import { H1, Muted } from "@/components/ui/typography";
import { requireAdvisor } from "@/lib/wealth/session";

export default async function AdvisorTeamPage() {
  const session = await requireAdvisor();

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Team</H1>
        <Muted>Advisors, wealth managers, and who looks after which client</Muted>
      </header>

      <TeamWorkspace
        currentAdvisorId={session.profile.advisor_id}
        isSuperadmin={session.profile.is_superadmin}
      />
    </PageShell>
  );
}
