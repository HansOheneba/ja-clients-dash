import { AdvisorPageHeader, advisorSurface } from "@/components/advisors/advisor-surface";
import { MessagesWorkspace } from "@/components/advisors/messages-workspace";
import { PageShell } from "@/components/layout/page-shell";

export default function AdvisorMessagesPage() {
  return (
    <PageShell className={advisorSurface.pageGap}>
      <AdvisorPageHeader
        title="Messages"
        description="Client communication threads, unread first"
      />
      <MessagesWorkspace />
    </PageShell>
  );
}
