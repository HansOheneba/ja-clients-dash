import Link from "next/link";
import { FileText, UserPlus, Users } from "lucide-react";

import { AttentionFeed } from "@/components/advisors/attention-feed";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import {
  countSessionsThisWeek,
  enforceReviewDueStatus,
  getAttentionFeed,
  listClientsExtended,
} from "@/lib/wealth/wm-queries";
import { requireAdvisor } from "@/lib/wealth/session";
import { formatUsd } from "@/lib/wealth/constants";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  onboarding: "Onboarding",
  active: "Active",
  review_due: "Review due",
  inactive: "Inactive",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatReturn(pct: number | null) {
  if (pct == null) return "N/A";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export default async function AdvisorDashboardPage() {
  const session = await requireAdvisor();
  await enforceReviewDueStatus();

  const advisorId = session.profile.advisor_id;
  const [clients, attentionItems, sessionsThisWeek] = await Promise.all([
    listClientsExtended(advisorId),
    getAttentionFeed(advisorId),
    countSessionsThisWeek(advisorId),
  ]);

  const totalAum = clients.reduce((sum, c) => sum + c.aum, 0);
  const activeCount = clients.filter((c) => c.status === "active").length;
  const needsAttention = attentionItems.length;
  const firstName = session.profile.full_name?.split(" ")[0] ?? "there";
  const recentClients = [...clients].sort((a, b) => b.aum - a.aum).slice(0, 6);

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-body-sm font-medium text-brand-accent">Prosper with Purpose</p>
          <H1>Good morning, {firstName}</H1>
          <Muted>Your book at a glance</Muted>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/advisors/dashboard/clients"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Users className="size-4" />
            All clients
          </Link>
          <Link href="/advisors/dashboard/clients/new" className={cn(buttonVariants({ size: "sm" }))}>
            <UserPlus className="size-4" />
            Add client
          </Link>
          <Link
            href="/advisors/dashboard/reports"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <FileText className="size-4" />
            Generate report
          </Link>
        </div>
      </header>

      <KpiStrip>
        <KpiItem
          label="Total AUM"
          value={formatUsd(totalAum)}
          change={`${clients.length} clients`}
          trend="neutral"
        />
        <KpiItem
          label="Active clients"
          value={String(activeCount)}
          change={`${clients.length - activeCount} other statuses`}
          trend="up"
        />
        <KpiItem
          label="Needs attention"
          value={String(needsAttention)}
          change="Across your book"
          trend={needsAttention > 0 ? "down" : "neutral"}
        />
        <KpiItem
          label="Sessions this week"
          value={String(sessionsThisWeek)}
          change="Confirmed sessions"
          trend="neutral"
        />
      </KpiStrip>

      <div>
        <TextSmall className="mb-2 font-medium">Needs your attention</TextSmall>
        <AttentionFeed items={attentionItems} />
      </div>

      <DashCard>
        <DashCardHeader>
          <div>
            <DashCardTitle>Your clients</DashCardTitle>
            <DashCardDescription>Latest values and period returns</DashCardDescription>
          </div>
          <Link
            href="/advisors/dashboard/clients"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
          >
            View all
          </Link>
        </DashCardHeader>
        <DashCardContent className="gap-0 p-0">
          {recentClients.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Muted>No clients yet. Add your first client to get started.</Muted>
              <Link
                href="/advisors/dashboard/clients/new"
                className={cn(buttonVariants({ size: "sm" }), "mt-4")}
              >
                Add client
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 border-b border-border bg-muted/30 px-6 py-2 text-xs font-medium text-muted-foreground">
                <span>Client</span>
                <span>Value</span>
                <span>Period return</span>
                <span>Status</span>
              </div>
              {recentClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/advisors/dashboard/clients/${client.id}`}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 border-b border-border/60 px-6 py-3 transition-colors last:border-0 hover:bg-muted/40"
                >
                  <span className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {initials(client.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <TextSmall className="font-medium">{client.full_name}</TextSmall>
                  </span>
                  <TextSmall>{formatUsd(client.aum)}</TextSmall>
                  <TextSmall
                    className={
                      client.period_return_pct != null && client.period_return_pct < 0
                        ? "text-destructive"
                        : "text-emerald-700"
                    }
                  >
                    {formatReturn(client.period_return_pct)}
                  </TextSmall>
                  <TextSmall className="text-muted-foreground">
                    {STATUS_LABEL[client.status] ?? client.status}
                  </TextSmall>
                </Link>
              ))}
            </>
          )}
        </DashCardContent>
      </DashCard>
    </PageShell>
  );
}
