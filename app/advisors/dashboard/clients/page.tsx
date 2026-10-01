import Link from "next/link";
import {
  AlertTriangle,
  Landmark,
  UserPlus,
  Users,
} from "lucide-react";

import {
  AdvisorPageHeader,
  MetricCard,
  advisorPrimaryAction,
  advisorSurface,
} from "@/components/advisors/advisor-surface";
import { ClientsRosterWorkspace } from "@/components/advisors/clients-roster-workspace";
import { PageShell } from "@/components/layout/page-shell";
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
    <PageShell className={advisorSurface.pageGap}>
      <AdvisorPageHeader
        title="Clients"
        description={`${clients.length} in your book. Who they are, where they stand, and what needs attention.`}
        actions={
          <Link href="/advisors/dashboard/clients/new" className={advisorPrimaryAction()}>
            <UserPlus className="size-3.5" />
            Add client
          </Link>
        }
      />

      <section
        aria-label="Book snapshot"
        className="grid grid-cols-2 gap-2.5 xl:grid-cols-4"
      >
        <MetricCard
          label="Total AUM"
          value={formatUsd(totalAum)}
          detail={`${clients.length} clients`}
          tone="navy"
          icon={<Landmark className="size-3.5" />}
        />
        <MetricCard
          label="Active"
          value={String(activeCount)}
          detail="No action needed"
          tone="sage"
          icon={<Users className="size-3.5" />}
        />
        <MetricCard
          label="Review due"
          value={String(reviewDue)}
          detail={reviewDue > 0 ? "Requires attention" : "None waiting"}
          tone="warm"
          icon={<AlertTriangle className="size-3.5" />}
        />
        <MetricCard
          label="Onboarding"
          value={String(onboarding)}
          detail={onboarding > 0 ? "Setup still in progress" : "All set up"}
          tone="gold"
          icon={<UserPlus className="size-3.5" />}
        />
      </section>

      <ClientsRosterWorkspace
        clients={clients}
        advisors={advisors}
        reportsDueCount={new Set(outstanding.map((row) => row.clientId)).size}
      />
    </PageShell>
  );
}
