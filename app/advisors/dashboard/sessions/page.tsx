import { AdvisorPageHeader, advisorSurface } from "@/components/advisors/advisor-surface";
import { SessionsWorkspace } from "@/components/advisors/sessions-workspace";
import { PageShell } from "@/components/layout/page-shell";

export default function AdvisorSessionsPage() {
  return (
    <PageShell className={advisorSurface.pageGap}>
      <AdvisorPageHeader
        title="Sessions"
        description="Calendar, requests, and recap backlog across your book"
      />
      <SessionsWorkspace />
    </PageShell>
  );
}
