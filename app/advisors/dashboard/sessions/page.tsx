import { PageShell } from "@/components/layout/page-shell";
import { SessionsWorkspace } from "@/components/advisors/sessions-workspace";
import { H1, Muted } from "@/components/ui/typography";

export default function AdvisorSessionsPage() {
  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Sessions</H1>
        <Muted>Calendar, requests, and recap backlog across your book</Muted>
      </header>
      <SessionsWorkspace />
    </PageShell>
  );
}
