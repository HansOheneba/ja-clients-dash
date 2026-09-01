import { PageShell } from "@/components/layout/page-shell";
import { DocumentsWorkspace } from "@/components/advisors/documents-workspace";
import { H1, Muted } from "@/components/ui/typography";

export default function AdvisorDocumentsPage() {
  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Documents</H1>
        <Muted>Outstanding requests and expiring KYC across your book</Muted>
      </header>
      <DocumentsWorkspace />
    </PageShell>
  );
}
