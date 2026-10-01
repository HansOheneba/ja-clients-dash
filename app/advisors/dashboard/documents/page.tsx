import { AdvisorPageHeader, advisorSurface } from "@/components/advisors/advisor-surface";
import { DocumentsWorkspace } from "@/components/advisors/documents-workspace";
import { PageShell } from "@/components/layout/page-shell";

export default function AdvisorDocumentsPage() {
  return (
    <PageShell className={advisorSurface.pageGap}>
      <AdvisorPageHeader
        title="Documents"
        description="Outstanding requests and expiring KYC across your book"
      />
      <DocumentsWorkspace />
    </PageShell>
  );
}
