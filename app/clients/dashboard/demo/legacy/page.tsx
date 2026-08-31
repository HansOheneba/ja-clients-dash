"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  FileText,
  Shield,
  Sparkles,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { H1, H2, H3, H4, Lead, Muted, Overline, Numeric, TextSmall } from "@/components/ui/typography";
import { useCurrency } from "@/lib/currency-context";
import { CELEREY_ICON_SRC, clientPromptChips } from "@/lib/data/celerey";
import {
  getBeneficiaryAllocationSummary,
  getLegacyHealthOverview,
  legacyProfile,
  type LegacyHealthStatus,
  type SuccessionMilestone,
  type WillStatus,
} from "@/lib/data/legacy";
import { cn } from "@/lib/utils";

const HEALTH_STATUS_STYLE: Record<
  LegacyHealthStatus,
  { ring: string; badge: string; label: string }
> = {
  healthy: {
    ring: "text-emerald-600",
    badge: "border-emerald-200/60 bg-emerald-50/80 text-emerald-900",
    label: "Well established",
  },
  warning: {
    ring: "text-amber-600",
    badge: "border-amber-200/60 bg-amber-50/80 text-amber-900",
    label: "Needs attention",
  },
  critical: {
    ring: "text-red-600",
    badge: "border-red-200/60 bg-red-50/80 text-red-900",
    label: "Critical attention required",
  },
};

const WILL_STATUS_CONFIG: Record<
  WillStatus,
  { label: string; risk: "low" | "medium" | "high" }
> = {
  current: { label: "Current", risk: "low" },
  "review-required": { label: "Review required", risk: "medium" },
  "not-in-place": { label: "Not in place", risk: "high" },
};

type MilestoneStatus = SuccessionMilestone["status"];

const MILESTONE_DOT: Record<MilestoneStatus, string> = {
  completed: "bg-brand-accent",
  "in-progress": "bg-amber-500",
  pending: "bg-muted-foreground/30",
};

function ReadinessRing({ score, status }: { score: number; status: LegacyHealthStatus }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const style = HEALTH_STATUS_STYLE[status];

  return (
    <div className="relative size-36 shrink-0">
      <svg className="size-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/40"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={style.ring}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Numeric className="text-[2rem]">{score}</Numeric>
        <Overline className="mt-0.5">Readiness</Overline>
      </div>
    </div>
  );
}

function CelereyAssistantPanel() {
  const legacyChips = clientPromptChips.filter((chip) => chip.category === "legacy");

  return (
    <aside className="rounded-2xl border border-border/25 bg-linear-to-b from-card to-muted/20 px-6 py-7">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sidebar">
          <Image
            src={CELEREY_ICON_SRC}
            alt="Celerey"
            width={26}
            height={26}
            className="size-[26px] object-contain"
          />
        </div>
        <div>
          <H4>Ask Celerey</H4>
          <Muted className="mt-1 text-body-sm leading-relaxed">
            Your legacy planning assistant. Understand risks, gaps, and next steps instantly.
          </Muted>
        </div>
      </div>

      <Link
        href="/clients/dashboard/demo/celerey"
        className={cn(buttonVariants({ size: "default" }), "mt-6 w-full justify-center gap-2")}
      >
        <Sparkles className="size-4" />
        Start a conversation
      </Link>

      <div className="mt-6">
        <Overline className="mb-3 block">Suggested questions</Overline>
        <div className="flex flex-col gap-2">
          {legacyChips.map((chip) => (
            <Link
              key={chip.id}
              href={`/clients/dashboard/demo/celerey?q=${encodeURIComponent(chip.query)}`}
              className="rounded-xl border border-border/30 bg-background/60 px-3.5 py-2.5 text-body-sm font-medium text-foreground/85 transition-colors hover:border-brand-accent/40 hover:bg-muted/40"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

function LegacyHealthOverview() {
  const health = getLegacyHealthOverview(legacyProfile);
  const style = HEALTH_STATUS_STYLE[health.status];

  return (
    <section className="rounded-2xl border border-border/20 bg-linear-to-br from-card via-card to-muted/15 px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <H1 className="mb-3">Legacy</H1>
          <Lead className="max-w-2xl text-[1.05rem] leading-relaxed text-foreground/75">
            Your estate planning command center. Understand readiness, risks, and what requires
            action across wills, trusts, and succession.
          </Lead>
          <span
            className={cn(
              "mt-5 inline-flex items-center rounded-full border px-4 py-2 text-body-sm font-medium",
              style.badge,
            )}
          >
            {health.statusLabel}
          </span>
        </div>
        <ReadinessRing score={health.readinessScorePct} status={health.status} />
      </div>

      {(health.risks.length > 0 || health.missingItems.length > 0) && (
        <div className="mt-8 grid grid-cols-1 gap-6 border-t border-border/30 pt-8 sm:grid-cols-2">
          {health.risks.length > 0 ? (
            <div>
              <Overline className="mb-3 block text-amber-800/80">Key risks</Overline>
              <ul className="flex flex-col gap-2.5">
                {health.risks.map((risk) => (
                  <li key={risk} className="flex items-start gap-2.5 text-body-sm text-foreground/85">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {health.missingItems.length > 0 ? (
            <div>
              <Overline className="mb-3 block">Missing critical items</Overline>
              <ul className="flex flex-col gap-2.5">
                {health.missingItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-body-sm text-foreground/85">
                    <Circle className="mt-1.5 size-2 shrink-0 fill-muted-foreground/50 text-transparent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function ActionRequiredSection() {
  const p = legacyProfile;
  const inProgressMilestone = p.successionMilestones.find((m) => m.status === "in-progress");

  return (
    <section>
      <H2 className="mb-2">Action required</H2>
      <Muted className="mb-7 max-w-xl">
        Items your advisor has flagged for immediate attention.
      </Muted>

      <div className="flex flex-col gap-5">
        <article className="rounded-2xl border border-amber-200/50 bg-amber-50/40 px-6 py-7 sm:px-8">
          <Overline className="mb-2 block text-amber-800/90">Advisor recommendation</Overline>
          <H3 className="text-[1.2rem] leading-snug">Estate documents need updating</H3>
          <Muted className="mt-1.5 text-body-sm">Jude Addo · Senior Wealth Advisor</Muted>
          <Lead className="mt-5 max-w-3xl text-foreground/80">{p.advisorNote}</Lead>
          <Link
            href="/clients/dashboard/demo/sessions"
            className={cn(buttonVariants({ size: "default" }), "mt-6 gap-2")}
          >
            Book estate planning session
            <ArrowRight className="size-4" />
          </Link>
        </article>

        {p.willStatus === "review-required" ? (
          <article className="rounded-2xl border border-border/30 bg-card px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Overline className="mb-2 block text-amber-700/80">Legal risk</Overline>
                <H4>Will review overdue</H4>
                <Muted className="mt-1.5 text-body-sm">
                  Last updated {p.willLastUpdated}. Estate has grown since signing.
                </Muted>
              </div>
              <Button variant="outline">Request will review</Button>
            </div>
          </article>
        ) : null}

        {inProgressMilestone ? (
          <article className="rounded-2xl border border-border/30 bg-card px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Overline className="mb-2 block">In progress</Overline>
                <H4>{inProgressMilestone.title}</H4>
                <Muted className="mt-1.5 text-body-sm">
                  Target {inProgressMilestone.targetDate} · {inProgressMilestone.notes}
                </Muted>
              </div>
              <Button variant="outline">View milestone</Button>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}

function LegalFoundationSection() {
  const p = legacyProfile;
  const willCfg = WILL_STATUS_CONFIG[p.willStatus];
  const poaRisk = p.powerOfAttorney === "in-place" ? "low" : "high";

  const riskTone = (risk: "low" | "medium" | "high") =>
    risk === "low"
      ? "text-emerald-700"
      : risk === "medium"
        ? "text-amber-700"
        : "text-red-700";

  return (
    <section>
      <H2 className="mb-2">Legal foundation</H2>
      <Muted className="mb-7 max-w-xl">
        Core estate documents that govern distribution and decision-making.
      </Muted>

      <div className="overflow-hidden rounded-2xl border border-border/25 bg-card">
        <div className="flex items-center gap-3 border-b border-border/30 px-6 py-4 sm:px-8">
          <Shield className="size-5 text-brand-accent" />
          <H4>Will and power of attorney</H4>
        </div>

        <div className="grid grid-cols-1 divide-y divide-border/30 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <div className="px-6 py-6 sm:px-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <H4 className="text-body">Will</H4>
              <span className={cn("text-caption font-semibold uppercase tracking-wide", riskTone(willCfg.risk))}>
                {willCfg.label}
              </span>
            </div>
            <dl className="flex flex-col gap-3">
              <div className="flex justify-between gap-4">
                <Muted>Last updated</Muted>
                <TextSmall className="font-medium">{p.willLastUpdated}</TextSmall>
              </div>
              <div className="flex justify-between gap-4">
                <Muted>Solicitor</Muted>
                <TextSmall className="max-w-[60%] text-right font-medium">{p.willSolicitor}</TextSmall>
              </div>
            </dl>
            <Button variant="outline" size="sm" className="mt-5">
              Request will review
            </Button>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <H4 className="text-body">Power of attorney</H4>
              <span className={cn("text-caption font-semibold uppercase tracking-wide", riskTone(poaRisk))}>
                {p.powerOfAttorney === "in-place" ? "In place" : "Not in place"}
              </span>
            </div>
            <dl className="flex flex-col gap-3">
              <div className="flex justify-between gap-4">
                <Muted>POA holder</Muted>
                <TextSmall className="font-medium text-right">{p.poaHolder}</TextSmall>
              </div>
              <div className="flex justify-between gap-4">
                <Muted>Type</Muted>
                <TextSmall className="font-medium">Lasting Power of Attorney</TextSmall>
              </div>
            </dl>
            <Button variant="outline" size="sm" className="mt-5">
              View document
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BeneficiaryImpactSection() {
  const { format } = useCurrency();
  const p = legacyProfile;
  const summary = getBeneficiaryAllocationSummary(p);
  const [expanded, setExpanded] = useState(false);
  const previewCount = 2;
  const visibleBeneficiaries = expanded ? p.beneficiaries : p.beneficiaries.slice(0, previewCount);

  return (
    <section>
      <H2 className="mb-2">Beneficiary impact</H2>
      <Muted className="mb-7 max-w-xl">
        How your estate is allocated across beneficiaries and instruments.
      </Muted>

      <div className="rounded-2xl border border-border/25 bg-card px-6 py-7 sm:px-8">
        <div className="grid grid-cols-1 gap-6 border-b border-border/30 pb-7 sm:grid-cols-3">
          <div>
            <Overline className="mb-1.5 block">Total allocated</Overline>
            <p className="font-numeric text-3xl font-bold tracking-tight">{summary.totalPct}%</p>
            <Muted className="mt-1 text-body-sm">
              {summary.gapPct > 0 ? `${summary.gapPct}% uncovered` : "Fully allocated"}
            </Muted>
          </div>
          <div>
            <Overline className="mb-1.5 block">Beneficiaries</Overline>
            <p className="font-numeric text-3xl font-bold tracking-tight">{summary.beneficiaryCount}</p>
            <Muted className="mt-1 text-body-sm">Named across trust and insurance</Muted>
          </div>
          <div>
            <Overline className="mb-1.5 block">Covered estate value</Overline>
            <p className="font-numeric text-3xl font-bold tracking-tight">
              {format(summary.coveredValueUSD, { compact: true })}
            </p>
            <Muted className="mt-1 text-body-sm">Of {format(summary.estateValueUSD, { compact: true })} in trusts</Muted>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-0">
          {visibleBeneficiaries.map((b, index) => {
            const value = summary.estateValueUSD * (b.allocationPct / 100);
            return (
              <div
                key={b.id}
                className={cn(
                  "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
                  index > 0 && "border-t border-border/20",
                )}
              >
                <div className="min-w-0 flex-1">
                  <TextSmall className="font-semibold">{b.name}</TextSmall>
                  <Muted className="text-body-sm">
                    {b.relation} · {b.instrument}
                  </Muted>
                  <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted/50">
                    <div
                      className="h-full rounded-full bg-brand-accent"
                      style={{ width: `${b.allocationPct}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <p className="font-numeric text-2xl font-bold">{b.allocationPct}%</p>
                  <Muted className="font-numeric text-body-sm">{format(value, { compact: true })}</Muted>
                </div>
              </div>
            );
          })}
        </div>

        {p.beneficiaries.length > previewCount ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 gap-2 px-0 text-brand-primary hover:bg-transparent"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <>
                Show fewer beneficiaries
                <ChevronUp className="size-4" />
              </>
            ) : (
              <>
                View all {p.beneficiaries.length} beneficiaries
                <ChevronDown className="size-4" />
              </>
            )}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function DependentsSection() {
  const p = legacyProfile;

  return (
    <section>
      <H2 className="mb-2">Household dependents</H2>
      <Muted className="mb-6 text-body-sm">{p.dependents.length} registered · guardianship and care provisions</Muted>

      <div className="rounded-xl border border-border/20 bg-muted/10 divide-y divide-border/20">
        {p.dependents.map((dep) => (
          <div
            key={dep.id}
            className="flex flex-col gap-1.5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <TextSmall className="font-medium">{dep.name}</TextSmall>
              <Muted className="text-body-sm">
                {dep.relation} · DOB {dep.dateOfBirth}
              </Muted>
              {dep.guardian ? (
                <Muted className="text-body-sm">Guardian: {dep.guardian}</Muted>
              ) : null}
            </div>
            {dep.notes ? (
              <TextSmall className="max-w-sm text-body-sm text-muted-foreground sm:text-right">
                {dep.notes}
              </TextSmall>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustStructuresSection() {
  const { format } = useCurrency();
  const p = legacyProfile;
  const [expanded, setExpanded] = useState(false);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <H2 className="mb-1">Trust structures</H2>
          <Muted className="text-body-sm">
            {p.trustStructures.length} structure{p.trustStructures.length !== 1 ? "s" : ""} on file
          </Muted>
        </div>
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Collapse" : "Expand details"}
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
      </div>

      {!expanded ? (
        <div className="rounded-xl border border-border/20 bg-muted/10 px-5 py-4">
          {p.trustStructures.map((trust) => (
            <div key={trust.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <TextSmall className="font-medium truncate">{trust.name}</TextSmall>
                  <Muted className="text-body-sm">
                    {trust.type} · {format(trust.estimatedValueUSD, { compact: true })}
                  </Muted>
                </div>
              </div>
              <span className="shrink-0 text-caption font-medium capitalize text-emerald-700">
                {trust.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {p.trustStructures.map((trust) => (
            <article
              key={trust.id}
              className="rounded-xl border border-border/20 bg-card px-5 py-5 sm:px-6"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <TextSmall className="font-semibold">{trust.name}</TextSmall>
                  <Muted className="text-body-sm">
                    {trust.type} · {trust.jurisdictionFormed} · Est. {trust.established}
                  </Muted>
                </div>
                <span className="text-caption font-medium capitalize text-emerald-700">{trust.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Overline className="mb-1 block">Estimated value</Overline>
                  <TextSmall className="font-numeric font-medium">{format(trust.estimatedValueUSD)}</TextSmall>
                </div>
                <div>
                  <Overline className="mb-1 block">Trustees</Overline>
                  {trust.trustees.map((t) => (
                    <TextSmall key={t} className="block font-medium">
                      {t}
                    </TextSmall>
                  ))}
                </div>
                <div>
                  <Overline className="mb-1 block">Beneficiaries</Overline>
                  <TextSmall className="font-medium">{trust.beneficiaries.join(", ")}</TextSmall>
                </div>
              </div>
              <Muted className="mt-4 rounded-lg bg-muted/30 px-3 py-2.5 text-body-sm leading-relaxed">
                {trust.notes}
              </Muted>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  View trust deed
                </Button>
                <Link
                  href="/clients/dashboard/reports"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  All legal documents
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SuccessionTimeline() {
  const milestones = legacyProfile.successionMilestones;

  const statusIcon: Record<MilestoneStatus, React.ElementType> = {
    completed: CheckCircle2,
    "in-progress": Clock,
    pending: Circle,
  };

  return (
    <section>
      <H2 className="mb-2">Succession timeline</H2>
      <Muted className="mb-7 max-w-xl">
        Chronological view of your estate planning milestones and what comes next.
      </Muted>

      <div className="relative pl-1">
        <div className="absolute bottom-2 left-[5px] top-2 w-px bg-border/60" aria-hidden />
        <ul className="flex flex-col gap-0">
          {milestones.map((milestone) => {
            const Icon = statusIcon[milestone.status];
            return (
              <li key={milestone.id} className="relative flex gap-5 pb-8 last:pb-0">
                <span
                  className={cn(
                    "relative z-10 mt-1.5 flex size-[11px] shrink-0 items-center justify-center rounded-full border-2 border-card",
                    MILESTONE_DOT[milestone.status],
                  )}
                />
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <TextSmall className="font-semibold leading-snug">{milestone.title}</TextSmall>
                    <span className="inline-flex items-center gap-1.5 text-caption font-medium capitalize text-muted-foreground">
                      <Icon
                        className={cn(
                          "size-3.5",
                          milestone.status === "completed" && "text-brand-accent",
                          milestone.status === "in-progress" && "text-amber-500",
                          milestone.status === "pending" && "text-muted-foreground/50",
                        )}
                      />
                      {milestone.status.replace("-", " ")}
                    </span>
                  </div>
                  <Overline className="mt-1 block">{milestone.targetDate}</Overline>
                  <Muted className="mt-2 text-body-sm leading-relaxed">{milestone.notes}</Muted>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default function LegacyPage() {
  return (
    <PageShell className="flex flex-col gap-10 lg:gap-12">
      <LegacyHealthOverview />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <div className="order-2 flex min-w-0 flex-col gap-12 lg:order-1 lg:gap-14">
          <ActionRequiredSection />
          <LegalFoundationSection />
          <BeneficiaryImpactSection />
          <DependentsSection />
          <TrustStructuresSection />
          <SuccessionTimeline />
        </div>

        <div className="order-1 flex flex-col gap-6 lg:order-2 lg:sticky lg:top-8">
          <CelereyAssistantPanel />
        </div>
      </div>
    </PageShell>
  );
}
