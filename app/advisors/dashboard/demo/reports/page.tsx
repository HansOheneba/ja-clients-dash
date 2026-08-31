import { PageShell } from "@/components/layout/page-shell";
import { DemoReportWorkspace } from "@/components/reports/demo-report-workspace";
import { H1, Muted } from "@/components/ui/typography";

export default async function AdvisorDemoReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  return (
    <PageShell className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <H1>Generate a client report</H1>
        <Muted>
          Sample statement data and the same generate action used on a live client record.
        </Muted>
      </header>
      <DemoReportWorkspace initialClientId={client} />
    </PageShell>
  );
}
