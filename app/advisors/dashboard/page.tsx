import Link from "next/link";
import { ChevronRight, UserPlus, Users } from "lucide-react";

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
import { listClientsWithPortfolio } from "@/lib/wealth/queries";
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

export default async function AdvisorDashboardPage() {
  const session = await requireAdvisor();
  const clients = await listClientsWithPortfolio(null);

  const totalAum = clients.reduce((sum, c) => sum + c.aum, 0);
  const activeCount = clients.filter((c) => c.status === "active").length;
  const reviewDue = clients.filter((c) => c.status === "review_due").length;
  const onboarding = clients.filter((c) => c.status === "onboarding").length;
  const firstName = session.profile.full_name?.split(" ")[0] ?? "there";
  const recentClients = [...clients]
    .sort((a, b) => b.aum - a.aum)
    .slice(0, 6);

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
          change={`${onboarding} onboarding, ${reviewDue} review due`}
          trend="up"
        />
        <KpiItem
          label="Review due"
          value={String(reviewDue)}
          change="Requires attention"
          trend={reviewDue > 0 ? "down" : "neutral"}
        />
        <KpiItem
          label="Onboarding"
          value={String(onboarding)}
          change="New relationships"
          trend="neutral"
        />
      </KpiStrip>

      <DashCard>
        <DashCardHeader>
          <div>
            <DashCardTitle>Clients by portfolio value</DashCardTitle>
            <DashCardDescription>Latest statement values across your book</DashCardDescription>
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
            recentClients.map((client) => (
              <Link
                key={client.id}
                href={`/advisors/dashboard/clients/${client.id}`}
                className="flex items-center gap-3 border-b border-border/60 px-6 py-4 transition-colors last:border-0 hover:bg-muted/40"
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-muted text-xs font-medium">
                    {initials(client.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <TextSmall className="font-medium">{client.full_name}</TextSmall>
                  <Muted>
                    {STATUS_LABEL[client.status] ?? client.status}
                    {client.location ? ` · ${client.location}` : ""}
                  </Muted>
                </div>
                <TextSmall className="font-medium">{formatUsd(client.aum)}</TextSmall>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))
          )}
        </DashCardContent>
      </DashCard>

      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Demo gallery</DashCardTitle>
          <DashCardDescription>Sample screens with placeholder data</DashCardDescription>
        </DashCardHeader>
        <DashCardContent>
          <Muted className="mb-4">
            Tasks, sessions, book rollup charts, and Celerey demos live under the demo gallery.
          </Muted>
          <Link href="/advisors/dashboard/demo" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Open demo gallery
          </Link>
        </DashCardContent>
      </DashCard>
    </PageShell>
  );
}
