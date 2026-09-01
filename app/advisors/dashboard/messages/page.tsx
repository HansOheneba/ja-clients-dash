import { PageShell } from "@/components/layout/page-shell";
import { MessagesWorkspace } from "@/components/advisors/messages-workspace";
import { H1, Muted } from "@/components/ui/typography";

export default function AdvisorMessagesPage() {
  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Messages</H1>
        <Muted>Client communication threads, unread first</Muted>
      </header>
      <MessagesWorkspace />
    </PageShell>
  );
}
