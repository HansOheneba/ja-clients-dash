import Link from "next/link";
import { ChevronRight, UserPlus } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Badge } from "@/components/ui/badge";
import { H1, TextSmall, Muted } from "@/components/ui/typography";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { listClientsWithPortfolio } from "@/lib/wealth/queries";
import { requireAdvisor } from "@/lib/wealth/session";
import { formatUsd } from "@/lib/wealth/constants";

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

export default async function AdvisorClientsPage() {
  const session = await requireAdvisor();
  const clients = await listClientsWithPortfolio(null);

  const totalAum = clients.reduce((sum, c) => sum + c.aum, 0);
  const activeCount = clients.filter((c) => c.status === "active").length;
  const reviewDue = clients.filter((c) => c.status === "review_due").length;
  const onboarding = clients.filter((c) => c.status === "onboarding").length;

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <H1>Clients</H1>
          <Muted>Your book of business</Muted>
        </div>
        <Link
          href="/advisors/dashboard/clients/new"
          className={buttonVariants({ size: "sm" })}
        >
          <UserPlus className="size-4" />
          Add client
        </Link>
      </header>

      <KpiStrip>
        <KpiItem
          label="Total AUM"
          value={formatUsd(totalAum)}
          change={`${clients.length} clients`}
          trend="neutral"
        />
        <KpiItem
          label="Active"
          value={String(activeCount)}
          change="No action needed"
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
          change="In progress"
          trend="neutral"
        />
      </KpiStrip>

      <DashCard>
        <DashCardHeader>
          <div>
            <DashCardTitle>All clients</DashCardTitle>
            <DashCardDescription>
              {clients.length === 0
                ? "Add your first client to start managing portfolios."
                : `${clients.length} clients. Open a row to edit portfolio data and generate reports.`}
            </DashCardDescription>
          </div>
        </DashCardHeader>
        <DashCardContent className="gap-0 p-0">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/advisors/dashboard/clients/${client.id}`}
              className="flex items-center gap-4 border-b border-border/60 px-6 py-4 transition-colors hover:bg-muted/40 last:border-0"
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-muted text-xs font-medium">
                  {initials(client.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <TextSmall className="font-medium">{client.full_name}</TextSmall>
                <Muted>
                  {formatUsd(client.aum)} AUM
                  {client.location ? ` · ${client.location}` : ""}
                  {` · ${client.client_number}`}
                </Muted>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge
                  variant={
                    client.status === "active"
                      ? "secondary"
                      : client.status === "onboarding"
                        ? "default"
                        : "outline"
                  }
                >
                  {STATUS_LABEL[client.status] ?? client.status}
                </Badge>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </DashCardContent>
      </DashCard>
    </PageShell>
  );
}
