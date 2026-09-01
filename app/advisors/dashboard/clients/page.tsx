import Link from "next/link";
import { UserPlus } from "lucide-react";

import { ClientsRosterWorkspace } from "@/components/advisors/clients-roster-workspace";
import { SectionLabel } from "@/components/advisors/section-label";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { H1, Muted } from "@/components/ui/typography";
import { listAdvisorsWithStats } from "@/lib/wealth/queries";
import { listClientsExtended, listOutstandingReports } from "@/lib/wealth/wm-queries";
import { requireAdvisor } from "@/lib/wealth/session";
import { formatUsd } from "@/lib/wealth/constants";

export default async function AdvisorClientsPage() {
  await requireAdvisor();
  const [clients, advisors, outstanding] = await Promise.all([
    listClientsExtended(null),
    listAdvisorsWithStats(),
    listOutstandingReports(null),
  ]);

  const totalAum = clients.reduce((sum, c) => sum + c.aum, 0);
  const activeCount = clients.filter((c) => c.status === "active").length;
  const reviewDue = clients.filter((c) => c.status === "review_due").length;
  const onboarding = clients.filter((c) => c.status === "onboarding").length;

  return (
    <PageShell className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <H1>Clients</H1>
          <Muted>
            {clients.length} in your book. Who they are, where they stand, and what needs attention.
          </Muted>
        </div>
        <Link
          href="/advisors/dashboard/clients/new"
          className={buttonVariants({ size: "sm" })}
        >
          <UserPlus className="size-4" />
          Add client
        </Link>
      </header>

      <section className="flex flex-col gap-3">
        <SectionLabel>Book snapshot</SectionLabel>
        <div className="grid grid-cols-2 divide-y divide-border/70 overflow-hidden rounded-(--radius-card) border border-border/60 bg-card sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <SnapshotCell
            label="Total AUM"
            value={formatUsd(totalAum)}
            hint={`${clients.length} clients`}
          />
          <SnapshotCell
            label="Active"
            value={String(activeCount)}
            hint="No action needed"
          />
          <SnapshotCell
            label="Review due"
            value={String(reviewDue)}
            hint={reviewDue > 0 ? "Requires attention" : "None waiting"}
          />
          <SnapshotCell
            label="Onboarding"
            value={String(onboarding)}
            hint={onboarding > 0 ? "Setup still in progress" : "All set up"}
          />
        </div>
      </section>

      <ClientsRosterWorkspace
        clients={clients}
        advisors={advisors}
        reportsDueCount={new Set(outstanding.map((row) => row.clientId)).size}
      />
    </PageShell>
  );
}

function SnapshotCell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-bold tabular-nums tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
