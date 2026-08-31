"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Sparkles,
} from "lucide-react";

import { PortfolioOverview } from "@/components/advisors/portfolio-overview";
import { ClientProfileEditor } from "@/components/advisors/client-profile-editor";
import { ClientGoalsWorkspace } from "@/components/advisors/client-goals-workspace";
import { AdvisorReportsList } from "@/components/reports/advisor-reports-list";
import { AllocationPieChart, AssetAreaChart } from "@/components/charts/asset-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { PageSpinner } from "@/components/ui/page-spinner";
import { Textarea } from "@/components/ui/textarea";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { formatUsd } from "@/lib/wealth/constants";
import { cn } from "@/lib/utils";
import type { JaPortfolioSummary } from "@/lib/api/domain/wealth-portfolio";
import type {
  AdvisorListRow,
  ClientAddress,
  ClientUpdate,
  PortfolioSnapshot,
  StatementPeriod,
  WealthAdvisor,
  WealthClient,
} from "@/lib/wealth/types";

const TABS = ["Overview", "Profile", "Goals", "Portfolio", "Reports", "Notes"] as const;
type Tab = (typeof TABS)[number];

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
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdvisorClientDetail() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const invitedFromUrl = searchParams.get("invited");
  const inviteErrorFromUrl = searchParams.get("inviteError");
  const normalizedTab =
    tabFromUrl === "Documents" ? "Reports" : tabFromUrl;
  const initialTab =
    normalizedTab && TABS.includes(normalizedTab as Tab)
      ? (normalizedTab as Tab)
      : "Overview";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<WealthClient | null>(null);
  const [address, setAddress] = useState<ClientAddress | null>(null);
  const [periods, setPeriods] = useState<StatementPeriod[]>([]);
  const [portfolio, setPortfolio] = useState<JaPortfolioSummary | null>(null);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [updates, setUpdates] = useState<ClientUpdate[]>([]);
  const [assignedAdvisor, setAssignedAdvisor] = useState<WealthAdvisor | null>(null);
  const [advisors, setAdvisors] = useState<AdvisorListRow[]>([]);
  const [notes, setNotes] = useState("");
  const [inviteMessage, setInviteMessage] = useState<string | null>(
    inviteErrorFromUrl
      ? inviteErrorFromUrl
      : invitedFromUrl === "1"
        ? "Invitation sent."
        : null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load client");
      setClient(data.client);
      setAddress(data.address);
      setPeriods(data.periods ?? []);
      setPortfolio(data.portfolio);
      setSnapshots(data.snapshots ?? []);
      setUpdates(data.updates ?? []);
      setAssignedAdvisor(data.assignedAdvisor ?? null);
      setNotes(data.client?.advisor_notes ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load client");
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch("/api/advisors")
      .then((res) => res.json())
      .then((body) => setAdvisors(body.advisors ?? []))
      .catch(() => undefined);
  }, []);

  async function saveNotes() {
    if (!client) return;
    await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advisorNotes: notes }),
    });
    load();
  }

  async function sendInvite() {
    if (!client) return;
    setInviteMessage(null);
    const res = await fetch(`/api/clients/${client.id}/invite`, { method: "POST" });
    const data = await res.json();
    setInviteMessage(res.ok ? "Invitation sent." : data.error ?? "Invite failed");
    if (res.ok) load();
  }

  if (loading) {
    return <PageSpinner className="px-4 sm:px-6" />;
  }

  if (!client) {
    return (
      <div className="flex flex-col gap-3 px-4 py-16 sm:px-6">
        <H1>Client not found</H1>
        <Muted>{error ?? "This client is not in the book."}</Muted>
        <Link href="/advisors/dashboard/clients" className="text-sm underline">
          Back to clients
        </Link>
      </div>
    );
  }

  const location = address
    ? [address.city, address.region].filter(Boolean).join(", ")
    : null;
  const slices = (portfolio?.buckets ?? []).map((b) => ({
    name: b.label,
    value: Math.round(b.allocationPct),
    color: b.id === "income"
      ? "#b2936b"
      : b.id === "growth"
        ? "#202356"
        : b.id === "venture"
          ? "#829850"
          : b.id === "treasury"
            ? "#484848"
            : "#c4b5a0",
  }));

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6">
      <Link
        href="/advisors/dashboard/clients"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All clients
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-sidebar text-lg font-medium text-sidebar-foreground">
              {initials(client.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <H1 className="leading-none">{client.full_name}</H1>
              <Badge variant={client.status === "active" ? "secondary" : "outline"}>
                {STATUS_LABEL[client.status] ?? client.status}
              </Badge>
              <Badge variant="outline">{client.client_number}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5" />
                {client.email}
              </span>
              {client.phone ? (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />
                  {client.phone}
                </span>
              ) : null}
              {location ? (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {location}
                </span>
              ) : null}
              {assignedAdvisor ? (
                <span className="text-sm text-muted-foreground">
                  Wealth manager: {assignedAdvisor.full_name}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">No wealth manager assigned</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href={`/advisors/dashboard/clients/${client.id}/statement`}>
            <Button size="sm">Statement data</Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Client actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52" sideOffset={6}>
              <DropdownMenuItem onClick={sendInvite}>
                <Mail className="size-4" />
                {client.invited_at ? "Resend invite" : "Send invite"}
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/advisors/dashboard/demo/celerey?clientId=${client.id}`} />}>
                <Sparkles className="size-4" />
                Ask Celerey
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<a href={`/api/clients/${client.id}/export`} download />}
              >
                <Download className="size-4" />
                Export data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {inviteMessage ? <Muted>{inviteMessage}</Muted> : null}

      <div className="sticky top-14 z-10 -mx-4 overflow-x-auto border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <nav className="flex min-w-max gap-1 py-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "Overview" && (
        <div className="flex flex-col gap-6 pb-12">
          <DashCard padding="sm" className="border-brand-primary/20 bg-brand-primary/5">
            <DashCardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <TextSmall className="font-medium">Statement data</TextSmall>
                <Muted>
                  Enter monthly bucket values and transactions on the statement data page.
                  Trends and monthly, quarterly, or annual PDFs are built from that data.
                </Muted>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/advisors/dashboard/clients/${client.id}/statement`}>
                  <Button size="sm">Enter statement data</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("Reports")}>
                  Reports
                </Button>
              </div>
            </DashCardContent>
          </DashCard>

          <DashCard padding="sm">
            <DashCardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <TextSmall className="font-medium">Goals</TextSmall>
                <Muted>
                  Add as many as you need. Each one has a name, amounts, and a date. That is
                  what the client sees on My Goals.
                </Muted>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("Goals")}>
                Add goals
              </Button>
            </DashCardContent>
          </DashCard>

          <KpiStrip>
            <KpiItem
              label="Portfolio value"
              value={formatUsd(portfolio?.totalUSD ?? 0)}
              change={portfolio ? `${portfolio.periodReturnPct.toFixed(1)}% this period` : "No snapshot yet"}
              trend={(portfolio?.periodGainUsd ?? 0) >= 0 ? "up" : "down"}
            />
            <KpiItem
              label="Period gain"
              value={formatUsd(portfolio?.periodGainUsd ?? 0)}
              change="Invested capital"
              trend={(portfolio?.periodGainUsd ?? 0) >= 0 ? "up" : "neutral"}
            />
            <KpiItem
              label="YTD"
              value={`${(portfolio?.ytdPct ?? 0).toFixed(1)}%`}
              change="Statement YTD"
              trend="neutral"
            />
            <KpiItem
              label="Portal"
              value={client.auth_user_id ? "Linked" : "Not invited"}
              change={client.invited_at ? "Invitation sent" : "Send an invite"}
              trend={client.auth_user_id ? "up" : "neutral"}
            />
          </KpiStrip>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <DashCard>
              <DashCardHeader>
                <div>
                  <DashCardTitle>Allocation</DashCardTitle>
                  <DashCardDescription>JA managed buckets</DashCardDescription>
                </div>
              </DashCardHeader>
              <DashCardContent>
                {slices.length > 0 ? <AllocationPieChart data={slices} /> : <Muted>No holdings yet.</Muted>}
              </DashCardContent>
            </DashCard>
            <DashCard className="lg:col-span-2">
              <DashCardHeader>
                <div>
                  <DashCardTitle>Value over time</DashCardTitle>
                  <DashCardDescription>From portfolio history</DashCardDescription>
                </div>
              </DashCardHeader>
              <DashCardContent>
                {portfolio && portfolio.history.length > 1 ? (
                  <AssetAreaChart
                    data={portfolio.history}
                    color="#202356"
                    gradientId={`hist-${client.id}`}
                    height={220}
                    yAxisLabel="Value (USD)"
                    seriesLabel="Portfolio value"
                  />
                ) : (
                  <Muted>Add history points by saving a statement period.</Muted>
                )}
              </DashCardContent>
            </DashCard>
          </div>

          <DashCard>
            <DashCardHeader>
              <DashCardTitle>Client updates</DashCardTitle>
            </DashCardHeader>
            <DashCardContent className="gap-3">
              {updates.length === 0 ? (
                <Muted>No updates yet. Saving the portfolio or generating a report will post one.</Muted>
              ) : (
                updates.slice(0, 8).map((item) => (
                  <div key={item.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <TextSmall className="font-medium">{item.title}</TextSmall>
                    <Muted>{item.body}</Muted>
                  </div>
                ))
              )}
            </DashCardContent>
          </DashCard>
        </div>
      )}

      {activeTab === "Profile" && (
        <ClientProfileEditor
          client={client}
          address={address}
          advisors={advisors}
          onSaved={load}
        />
      )}

      {activeTab === "Goals" && (
        <ClientGoalsWorkspace clientId={client.id} clientName={client.full_name} />
      )}

      {activeTab === "Portfolio" && (
        <PortfolioOverview
          clientId={client.id}
          portfolio={portfolio}
          snapshots={snapshots}
          latestPeriod={periods[0] ?? null}
        />
      )}

      {activeTab === "Reports" && (
        <div className="flex flex-col gap-4 pb-12">
          <DashCard padding="sm" className="border-brand-primary/20 bg-brand-primary/5">
            <DashCardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TextSmall className="leading-relaxed text-muted-foreground">
                The PDF uses monthly values saved on the statement data page. Enter a month of
                figures there, then generate a monthly, quarterly, or annual statement.
              </TextSmall>
              <Link href={`/advisors/dashboard/clients/${client.id}/statement`}>
                <Button variant="outline" size="sm" className="shrink-0">
                  Enter statement data
                </Button>
              </Link>
            </DashCardContent>
          </DashCard>
          <AdvisorReportsList clientId={client.id} />
        </div>
      )}

      {activeTab === "Notes" && (
        <div className="flex max-w-2xl flex-col gap-3 pb-12">
          <Textarea rows={10} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button className="w-fit" onClick={saveNotes}>
            Save notes
          </Button>
        </div>
      )}
    </div>
  );
}
