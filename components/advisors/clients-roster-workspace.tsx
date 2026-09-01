"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

import { SectionLabel } from "@/components/advisors/section-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Muted, TextSmall } from "@/components/ui/typography";
import { formatUsd } from "@/lib/wealth/constants";
import { cn } from "@/lib/utils";
import type { AdvisorListRow } from "@/lib/wealth/types";
import type { ClientListExtended } from "@/lib/wealth/wm-types";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "onboarding", label: "Onboarding" },
  { id: "active", label: "Active" },
  { id: "review_due", label: "Review due" },
  { id: "inactive", label: "Inactive" },
] as const;

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

function formatReturn(pct: number | null) {
  if (pct == null) return null;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function statusDotClass(status: string) {
  if (status === "active") return "bg-emerald-600";
  if (status === "review_due") return "bg-destructive";
  if (status === "onboarding") return "bg-brand-accent";
  return "bg-muted-foreground";
}

export function ClientsRosterWorkspace({
  clients,
  advisors,
}: {
  clients: ClientListExtended[];
  advisors: AdvisorListRow[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [advisorFilter, setAdvisorFilter] = useState("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkAdvisorId, setBulkAdvisorId] = useState("");

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: clients.length };
    for (const tab of STATUS_TABS) {
      if (tab.id === "all") continue;
      next[tab.id] = clients.filter((c) => c.status === tab.id).length;
    }
    return next;
  }, [clients]);

  const attentionOnboarding = counts.onboarding ?? 0;
  const attentionReview = counts.review_due ?? 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (advisorFilter !== "all" && c.advisor_id !== advisorFilter) return false;
      if (openOnly && !c.has_open_request) return false;
      if (!q) return true;
      return (
        c.full_name.toLowerCase().includes(q) ||
        c.client_number.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [clients, search, statusFilter, advisorFilter, openOnly]);

  async function bulkAssign() {
    if (selected.size === 0 || !bulkAdvisorId) return;
    setBulkLoading(true);
    try {
      await fetch("/api/clients/bulk-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientIds: [...selected], advisorId: bulkAdvisorId }),
      });
      setSelected(new Set());
      window.location.reload();
    } finally {
      setBulkLoading(false);
    }
  }

  async function tagForReview() {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      await fetch("/api/clients/bulk-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientIds: [...selected] }),
      });
      setSelected(new Set());
      window.location.reload();
    } finally {
      setBulkLoading(false);
    }
  }

  function toggleAll(checked: boolean) {
    if (checked) setSelected(new Set(filtered.map((c) => c.id)));
    else setSelected(new Set());
  }

  return (
    <section className="flex flex-col gap-4">
      {attentionOnboarding + attentionReview > 0 && statusFilter === "all" ? (
        <div className="flex flex-col gap-2 rounded-(--radius-card) border border-border/60 bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <TextSmall className="font-medium">Needs attention</TextSmall>
            <Muted className="text-[13px]">
              {attentionOnboarding > 0
                ? `${attentionOnboarding} still onboarding`
                : null}
              {attentionOnboarding > 0 && attentionReview > 0 ? ". " : null}
              {attentionReview > 0 ? `${attentionReview} review due` : null}.
            </Muted>
          </div>
          <div className="flex flex-wrap gap-2">
            {attentionOnboarding > 0 ? (
              <Button size="sm" variant="outline" onClick={() => setStatusFilter("onboarding")}>
                View onboarding
              </Button>
            ) : null}
            {attentionReview > 0 ? (
              <Button size="sm" variant="outline" onClick={() => setStatusFilter("review_due")}>
                View reviews
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <SectionLabel>Roster</SectionLabel>
        <nav className="flex min-w-max gap-5 overflow-x-auto border-b border-border/70">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.id;
            const count = counts[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "relative whitespace-nowrap py-2.5 text-sm transition-[color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  active
                    ? "font-semibold text-brand-primary"
                    : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                  {count}
                </span>
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-accent transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, or client number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {advisors.length > 1 ? (
          <Select value={advisorFilter} onChange={(e) => setAdvisorFilter(e.target.value)}>
            <option value="all">All managers</option>
            {advisors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name}
              </option>
            ))}
          </Select>
        ) : null}
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
            className="size-4 rounded border-border"
          />
          Open requests
        </label>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-(--radius-card) border border-border/60 bg-card px-4 py-2.5">
          <TextSmall className="font-medium">{selected.size} selected</TextSmall>
          <Select
            value={bulkAdvisorId}
            onChange={(e) => setBulkAdvisorId(e.target.value)}
            className="h-8 w-44 text-xs"
          >
            <option value="">Assign to...</option>
            {advisors.filter((a) => a.is_active).map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name}
              </option>
            ))}
          </Select>
          <Button
            size="sm"
            disabled={bulkLoading || !bulkAdvisorId}
            onClick={bulkAssign}
          >
            Assign manager
          </Button>
          <Button size="sm" variant="outline" disabled={bulkLoading} onClick={tagForReview}>
            Tag for review
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-(--radius-card) border border-border/60 bg-card">
        <div className="hidden items-center gap-3 border-b border-border/60 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground lg:grid lg:grid-cols-[auto_minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto]">
          <input
            type="checkbox"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={(e) => toggleAll(e.target.checked)}
            className="size-4 rounded border-border"
            aria-label="Select all clients"
          />
          <span>Client</span>
          <span>Portfolio</span>
          <span>Status</span>
          <span>Wealth manager</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <TextSmall className="font-medium">No clients match these filters</TextSmall>
            <Muted className="mt-1">Try another status, or clear search.</Muted>
          </div>
        ) : (
          filtered.map((client) => {
            const ret = formatReturn(client.period_return_pct);
            return (
              <div
                key={client.id}
                className="flex items-center gap-3 border-b border-border/50 px-4 py-3.5 last:border-0 transition-colors duration-150 hover:bg-muted/30 lg:grid lg:grid-cols-[auto_minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto]"
              >
                <input
                  type="checkbox"
                  checked={selected.has(client.id)}
                  onChange={(e) => {
                    const next = new Set(selected);
                    if (e.target.checked) next.add(client.id);
                    else next.delete(client.id);
                    setSelected(next);
                  }}
                  className="size-4 rounded border-border"
                  aria-label={`Select ${client.full_name}`}
                />
                <Link
                  href={`/advisors/dashboard/clients/${client.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none"
                >
                  <Avatar>
                    <AvatarFallback className="bg-brand-primary/10 text-xs font-medium text-brand-primary">
                      {initials(client.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <TextSmall className="truncate font-medium">{client.full_name}</TextSmall>
                    <Muted className="truncate text-[12px]">
                      {STATUS_LABEL[client.status] ?? client.status}
                      {" · "}
                      {client.client_number}
                      {client.location ? ` · ${client.location}` : ""}
                    </Muted>
                    <Muted className="mt-0.5 tabular-nums text-[12px] lg:hidden">
                      {formatUsd(client.aum)}
                      {ret ? ` · ${ret}` : ""}
                    </Muted>
                  </div>
                </Link>
                <div className="hidden min-w-0 lg:block">
                  <TextSmall className="tabular-nums">{formatUsd(client.aum)}</TextSmall>
                  <Muted className="text-[12px]">
                    {ret ? (
                      <span
                        className={
                          client.period_return_pct != null && client.period_return_pct < 0
                            ? "text-destructive"
                            : "text-emerald-700"
                        }
                      >
                        {ret} period
                      </span>
                    ) : (
                      "No data yet"
                    )}
                  </Muted>
                </div>
                <div className="hidden min-w-0 lg:block">
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <span className={cn("size-1.5 rounded-full", statusDotClass(client.status))} />
                    {STATUS_LABEL[client.status] ?? client.status}
                  </span>
                  {client.has_open_request ? (
                    <Muted className="text-[12px]">Open request</Muted>
                  ) : client.next_review_date ? (
                    <Muted className="text-[12px]">
                      Review{" "}
                      {new Date(`${client.next_review_date}T12:00:00`).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Muted>
                  ) : (
                    <Muted className="text-[12px]">No review set</Muted>
                  )}
                </div>
                <Muted className="hidden truncate text-sm lg:block">
                  {client.advisor_name ?? "Unassigned"}
                </Muted>
                <Link
                  href={`/advisors/dashboard/clients/${client.id}`}
                  className="shrink-0 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  aria-label={`Open ${client.full_name}`}
                >
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
