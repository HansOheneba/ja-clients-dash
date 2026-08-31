"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Gavel,
  Globe,
  Home,
  Mail,
  MessageSquare,
  Plane,
  Shield,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { H1, H2, H3, H4, Lead, Muted, Overline, TextSmall } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  activeRequests,
  exclusiveEvents,
  getConciergeOverview,
  partnerCategories,
  serviceCategories,
  type ExclusiveEvent,
  type ServiceRequest,
  type ServiceRequestStatus,
} from "@/lib/data/concierge";

const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  CreditCard,
  Gavel,
  Car,
  Plane,
  Sparkles,
  Home,
  Shield,
  Briefcase,
};

const STATUS_DISPLAY: Record<
  ServiceRequestStatus,
  { label: string; tone: string }
> = {
  submitted: { label: "Waiting", tone: "text-slate-600" },
  "in-progress": { label: "In progress", tone: "text-amber-700" },
  pending: { label: "Blocked", tone: "text-red-700" },
  completed: { label: "Completed", tone: "text-emerald-700" },
};

const TIER_INTRO: Record<string, string> = {
  "JA Exclusive": "Cross-border access, residency, and private banking introductions.",
  "Advisory and Legal": "Legal, tax, insurance, and business advisory outcomes.",
  Property: "Residential and commercial property search and acquisition support.",
  "Travel and Lifestyle": "Travel, events, and day-to-day lifestyle coordination.",
};

function ConciergeOverviewHero() {
  const overview = getConciergeOverview();

  return (
    <section className="rounded-2xl border border-border/20 bg-linear-to-br from-card via-card to-muted/15 px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex items-center gap-2">
        <H1>Concierge</H1>
      </div>
      <Lead className="mt-3 max-w-2xl text-[1.05rem] leading-relaxed text-foreground/75">
        Your private concierge desk. Active workflows, curated opportunities, and
        introductions managed on your behalf.
      </Lead>

      <div className="mt-6 flex flex-wrap gap-3">
        <span className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-4 py-2 text-body-sm font-medium">
          {overview.activeCount} Active
        </span>
        {overview.attentionCount > 0 ? (
          <span className="inline-flex items-center rounded-full border border-amber-200/60 bg-amber-50/80 px-4 py-2 text-body-sm font-medium text-amber-900">
            {overview.attentionCount} Require attention
          </span>
        ) : null}
        <span className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-4 py-2 text-body-sm font-medium">
          {overview.inProgressCount} In progress
        </span>
        <span className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-4 py-2 text-body-sm font-medium text-foreground/80">
          Next milestone: {overview.nextMilestone}
        </span>
      </div>
    </section>
  );
}

function WorkflowProgress({ pct }: { pct: number }) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between">
        <Overline>Progress</Overline>
        <TextSmall className="font-numeric font-semibold tabular-nums">{pct}%</TextSmall>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
        <div
          className="h-full rounded-full bg-brand-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function WorkflowCard({
  request,
  emphasis = "default",
}: {
  request: ServiceRequest;
  emphasis?: "attention" | "default" | "completed";
}) {
  const ReqIcon = ICON_MAP[request.iconName] ?? Globe;
  const statusCfg = STATUS_DISPLAY[request.status];
  const progress = request.progressPct ?? (request.status === "completed" ? 100 : 0);

  return (
    <article
      className={cn(
        "rounded-2xl border px-6 py-7 sm:px-8",
        emphasis === "attention" && "border-amber-200/50 bg-amber-50/35",
        emphasis === "default" && "border-border/30 bg-card shadow-sm",
        emphasis === "completed" && "border-border/20 bg-muted/10",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              emphasis === "attention" ? "bg-amber-100/80" : "bg-brand-primary/8",
            )}
          >
            <ReqIcon
              className={cn(
                "size-5",
                emphasis === "attention" ? "text-amber-800" : "text-brand-primary",
              )}
            />
          </div>
          <div className="min-w-0">
            {emphasis === "attention" ? (
              <Overline className="mb-1.5 block text-amber-800/90">Requires your action</Overline>
            ) : null}
            <H3 className="text-[1.15rem] leading-snug">{request.title}</H3>
            <Muted className="mt-1 text-body-sm">
              {request.category} · Officer {request.officer}
            </Muted>
          </div>
        </div>
        <span className={cn("shrink-0 text-caption font-semibold uppercase tracking-wide", statusCfg.tone)}>
          {statusCfg.label}
        </span>
      </div>

      {request.nextStep ? (
        <div className="mt-5 rounded-xl bg-background/60 px-4 py-3.5">
          <Overline className="mb-1 block">Next step</Overline>
          <TextSmall className="font-medium leading-snug">{request.nextStep}</TextSmall>
        </div>
      ) : null}

      {emphasis !== "completed" ? <WorkflowProgress pct={progress} /> : null}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Overline className="mb-1 block">Submitted</Overline>
          <TextSmall className="font-medium">{request.submittedDate}</TextSmall>
        </div>
        <div>
          <Overline className="mb-1 block">Expected completion</Overline>
          <TextSmall className="font-medium">{request.expectedCompletion}</TextSmall>
        </div>
        {request.lastUpdate ? (
          <div>
            <Overline className="mb-1 block">Last update</Overline>
            <TextSmall className="font-medium">{request.lastUpdate}</TextSmall>
          </div>
        ) : null}
      </div>

      <Muted className="mt-4 text-body-sm leading-relaxed">{request.notes}</Muted>

      {emphasis === "attention" ? (
        <Button size="default" className="mt-6 gap-2">
          Take action
          <ArrowRight className="size-4" />
        </Button>
      ) : emphasis === "default" ? (
        <Button variant="outline" size="sm" className="mt-5">
          View workflow
        </Button>
      ) : null}
    </article>
  );
}

function ConciergeDeskPanel() {
  const overview = getConciergeOverview();

  return (
    <aside className="rounded-2xl border border-border/25 bg-linear-to-b from-card to-muted/20 px-6 py-7">
      <Overline className="mb-5 block">Your concierge desk</Overline>

      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-lg font-semibold text-white">
          KA
        </div>
        <div>
          <H4>{overview.primaryOfficer}</H4>
          <Muted className="text-body-sm">Lead Concierge Officer</Muted>
        </div>
      </div>

      <Muted className="mt-5 text-body-sm leading-relaxed">
        Your dedicated point of contact for workflows, introductions, and exclusive access.
      </Muted>

      <div className="mt-6 flex flex-col gap-2.5">
        <Link
          href="/clients/dashboard/messages"
          className={cn(buttonVariants({ size: "default" }), "w-full justify-center gap-2")}
        >
          <MessageSquare className="size-4" />
          Message concierge
        </Link>
        <Link
          href="/clients/dashboard/messages"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "w-full justify-center gap-2",
          )}
        >
          <Mail className="size-4" />
          Request introduction
        </Link>
      </div>

      <div className="mt-7 border-t border-border/30 pt-5">
        <Overline className="mb-3 block">Desk snapshot</Overline>
        <dl className="flex flex-col gap-2.5">
          <div className="flex justify-between gap-3">
            <Muted className="text-body-sm">Active workflows</Muted>
            <TextSmall className="font-semibold tabular-nums">{overview.activeCount}</TextSmall>
          </div>
          <div className="flex justify-between gap-3">
            <Muted className="text-body-sm">Awaiting your action</Muted>
            <TextSmall className="font-semibold tabular-nums">{overview.attentionCount}</TextSmall>
          </div>
        </dl>
      </div>
    </aside>
  );
}

function ServiceIntakeSection() {
  return (
    <section>
      <H2 className="mb-2">Request a service</H2>
      <Muted className="mb-7 max-w-xl">
        Tell us the outcome you need. Your concierge officer will coordinate execution.
      </Muted>

      <div className="flex flex-col gap-8">
        {serviceCategories.map((cat) => (
          <div key={cat.heading}>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <H4>{cat.heading}</H4>
              {cat.jaExclusive ? (
                <Badge className="h-5 w-fit px-2 text-[10px]">JA exclusive</Badge>
              ) : null}
            </div>
            <Muted className="mb-4 max-w-2xl text-body-sm">
              {TIER_INTRO[cat.heading] ?? "Coordinated concierge support for your request."}
            </Muted>

            <div className="overflow-hidden rounded-2xl border border-border/25 bg-card divide-y divide-border/20">
              {cat.services.map((svc) => {
                const SvcIcon = ICON_MAP[svc.iconName] ?? Globe;
                return (
                  <button
                    key={svc.label}
                    type="button"
                    className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/25 sm:px-6 sm:py-5"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 group-hover:bg-brand-primary/8">
                      <SvcIcon className="size-4 text-muted-foreground group-hover:text-brand-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <TextSmall className="font-semibold">{svc.label}</TextSmall>
                      <Muted className="mt-0.5 text-body-sm">{svc.description}</Muted>
                    </div>
                    <span className="hidden shrink-0 text-body-sm font-medium text-brand-primary sm:inline">
                      Request
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 group-hover:text-brand-primary" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedOpportunity({ event }: { event: ExclusiveEvent }) {
  return (
    <article className="rounded-2xl border border-border/25 bg-card px-7 py-8 shadow-sm sm:px-9 sm:py-9">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="default">
          {event.type === "event" ? "Featured event" : "Featured opportunity"}
        </Badge>
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
      </div>
      <H3 className="text-[1.35rem] leading-snug">{event.title}</H3>
      <Muted className="mt-2 text-body-sm">
        <Clock className="mr-1 inline size-3.5" />
        {event.date} · {event.location}
      </Muted>
      <Lead className="mt-5 max-w-3xl leading-relaxed text-foreground/80">{event.description}</Lead>
      <Button size="default" className="mt-6 gap-2">
        {event.cta}
        <ArrowRight className="size-4" />
      </Button>
    </article>
  );
}

function OpportunitiesSection() {
  const featured = exclusiveEvents.find((e) => e.featured) ?? exclusiveEvents[0];
  const secondary = exclusiveEvents.filter((e) => e.id !== featured.id);

  return (
    <section>
      <H2 className="mb-2">Opportunities and access</H2>
      <Muted className="mb-7 max-w-xl">
        Curated events and investment opportunities available exclusively to JA clients.
      </Muted>

      <FeaturedOpportunity event={featured} />

      {secondary.length > 0 ? (
        <div className="mt-5 flex flex-col gap-3">
          {secondary.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-col gap-3 rounded-xl border border-border/20 bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {ev.type === "event" ? "Event" : "Opportunity"}
                  </Badge>
                </div>
                <TextSmall className="font-semibold">{ev.title}</TextSmall>
                <Muted className="text-body-sm">
                  {ev.date} · {ev.location}
                </Muted>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                {ev.cta}
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PartnerIntroductionSection() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(partnerCategories[0]?.label ?? null);

  return (
    <section>
      <H2 className="mb-2">Request an introduction</H2>
      <Muted className="mb-7 max-w-xl">
        Your concierge mediates introductions across our partner network. Select a category to
        request access.
      </Muted>

      <div className="overflow-hidden rounded-2xl border border-border/25 bg-card">
        {partnerCategories.map((category) => {
          const isOpen = expandedCategory === category.label;
          return (
            <div key={category.label} className="border-b border-border/20 last:border-0">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/20 sm:px-6"
                onClick={() =>
                  setExpandedCategory(isOpen ? null : category.label)
                }
              >
                <div className="flex items-center gap-3">
                  <Users className="size-4 shrink-0 text-brand-accent" />
                  <div>
                    <TextSmall className="font-semibold">{category.label}</TextSmall>
                    <Muted className="text-body-sm">
                      {category.partners.length} partner{category.partners.length !== 1 ? "s" : ""}
                    </Muted>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                )}
              </button>

              {isOpen ? (
                <div className="border-t border-border/20 bg-muted/10 px-5 py-4 sm:px-6">
                  <ul className="flex flex-col gap-3">
                    {category.partners.map((partner) => (
                      <li
                        key={partner}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <TextSmall className="font-medium">{partner}</TextSmall>
                        <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                          Request introduction
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ConciergePage() {
  const [showCompleted, setShowCompleted] = useState(false);

  const attentionRequests = activeRequests.filter((r) => r.requiresAttention);
  const activeWorkflows = activeRequests.filter(
    (r) => r.status !== "completed" && !r.requiresAttention,
  );
  const completedRequests = activeRequests.filter((r) => r.status === "completed");

  return (
    <PageShell className="flex flex-col gap-10 lg:gap-12">
      <ConciergeOverviewHero />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <div className="order-2 flex min-w-0 flex-col gap-12 lg:order-1 lg:gap-14">
          {attentionRequests.length > 0 ? (
            <section>
              <H2 className="mb-2">Requires your attention</H2>
              <Muted className="mb-7 max-w-xl">
                Workflows waiting on your decision or documents.
              </Muted>
              <div className="flex flex-col gap-5">
                {attentionRequests.map((req) => (
                  <WorkflowCard key={req.id} request={req} emphasis="attention" />
                ))}
              </div>
            </section>
          ) : null}

          {activeWorkflows.length > 0 ? (
            <section>
              <H2 className="mb-2">In progress</H2>
              <Muted className="mb-7 max-w-xl">
                Active workflows being managed by your concierge team.
              </Muted>
              <div className="flex flex-col gap-5">
                {activeWorkflows.map((req) => (
                  <WorkflowCard key={req.id} request={req} emphasis="default" />
                ))}
              </div>
            </section>
          ) : null}

          {completedRequests.length > 0 ? (
            <section>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <H2 className="mb-1">Completed</H2>
                  <Muted className="text-body-sm">
                    {completedRequests.length} closed workflow
                    {completedRequests.length !== 1 ? "s" : ""}
                  </Muted>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowCompleted((v) => !v)}
                >
                  {showCompleted ? "Hide" : "Show"}
                  {showCompleted ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </div>
              {showCompleted ? (
                <div className="flex flex-col gap-4">
                  {completedRequests.map((req) => (
                    <WorkflowCard key={req.id} request={req} emphasis="completed" />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-muted/10 px-5 py-4">
                  <CheckCircle2 className="size-4 shrink-0 text-brand-accent" />
                  <TextSmall className="text-muted-foreground">
                    {completedRequests.map((r) => r.title).join(" · ")}
                  </TextSmall>
                </div>
              )}
            </section>
          ) : null}

          <ServiceIntakeSection />
          <OpportunitiesSection />
          <PartnerIntroductionSection />
        </div>

        <div className="order-1 flex flex-col gap-6 lg:order-2 lg:sticky lg:top-8">
          <ConciergeDeskPanel />
        </div>
      </div>
    </PageShell>
  );
}
