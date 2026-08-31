"use client";

import Link from "next/link";
import {
  ArrowRight, Building, Clock, Download, Eye, FileText, Globe,
  MessageSquare, Shield, Wallet, type LucideIcon,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DashCard, DashCardContent, DashCardDescription, DashCardHeader, DashCardTitle,
} from "@/components/ui/dash-card";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { wealthPlan, type PlanSectionStatus } from "@/lib/data/wealth-plan";

const ICON_MAP: Record<string, LucideIcon> = { Wallet, Clock, FileText, ArrowRight, Globe, Building, Shield };

const STATUS_VARIANT: Record<PlanSectionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  "Current":             "secondary",
  "In progress":         "default",
  "Review recommended":  "outline",
};

export default function WealthPlanPage() {
  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <H1>Wealth Plan</H1>
          <Muted>Current plan · Version {wealthPlan.currentVersion} · Last updated {wealthPlan.lastUpdated} · Prepared by {wealthPlan.preparedBy}</Muted>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Download plan
          </Button>
          <Link href="/clients/dashboard/messages" className={buttonVariants({ size: "sm" })}>
            <MessageSquare className="size-4" />
            Ask your advisor
          </Link>
        </div>
      </header>

      {/* Current plan */}
      <DashCard className="border-brand-primary/30 bg-brand-primary/5">
        <DashCardHeader>
          <div>
            <DashCardTitle>Current Financial Plan</DashCardTitle>
            <DashCardDescription>
              Integrated Wealth Strategy · v{wealthPlan.currentVersion} · {wealthPlan.pageCount} pages
            </DashCardDescription>
          </div>
          <Badge variant="secondary">Active</Badge>
        </DashCardHeader>
        <DashCardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <TextSmall className="flex-1 leading-relaxed text-muted-foreground">{wealthPlan.description}</TextSmall>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm">
                <Eye className="size-4" />
                View plan
              </Button>
              <Button variant="outline" size="sm">
                <Download className="size-4" />
                Download PDF
              </Button>
            </div>
          </div>
          <div className="mt-4 border-t border-border/40 pt-4">
            <Muted className="mb-2">Previous versions</Muted>
            <div className="flex flex-wrap gap-2">
              {wealthPlan.versions.map(v => (
                <Button key={v.label} variant="ghost" size="sm" className="h-7 text-xs">
                  {v.label} · {v.date}
                </Button>
              ))}
            </div>
          </div>
        </DashCardContent>
      </DashCard>

      {/* CBI progress */}
      <DashCard className="border-amber-200 bg-amber-50/50">
        <DashCardHeader>
          <div>
            <DashCardTitle>Citizenship by Investment: {wealthPlan.cbi.program}</DashCardTitle>
            <DashCardDescription>
              Application stage {wealthPlan.cbi.stageIndex + 1} of {wealthPlan.cbi.stages.length} · Updated {wealthPlan.cbi.updatedDate}
            </DashCardDescription>
          </div>
          <Badge>In progress</Badge>
        </DashCardHeader>
        <DashCardContent>
          <div className="mb-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${wealthPlan.cbi.stages.length}, 1fr)` }}>
            {wealthPlan.cbi.stages.map((stage, i) => (
              <div key={stage} className="flex flex-col items-center gap-1">
                <div className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                  i <= wealthPlan.cbi.stageIndex ? "bg-brand-primary text-white" : "border-2 border-border text-muted-foreground"
                )}>
                  {i + 1}
                </div>
                <Muted className="text-center text-[10px] leading-tight hidden sm:block">{stage}</Muted>
              </div>
            ))}
          </div>
          <Progress value={wealthPlan.cbi.progressPct} className="h-1.5" />
          <div className="mt-3">
            <Link href="/clients/dashboard/demo/concierge" className={buttonVariants({ variant: "outline", size: "sm" })}>
              View full status
            </Link>
          </div>
        </DashCardContent>
      </DashCard>

      {/* Plan sections grid */}
      <div className="grid grid-cols-1 gap-(--spacing-grid) md:grid-cols-2">
        {wealthPlan.sections.map(sec => {
          const SectionIcon = ICON_MAP[sec.iconName] ?? FileText;
          return (
            <DashCard key={sec.id}>
              <DashCardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                    <SectionIcon className="size-5 text-brand-primary" />
                  </div>
                  <div>
                    <DashCardTitle>{sec.title}</DashCardTitle>
                    <DashCardDescription>Updated {sec.updatedDate}</DashCardDescription>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[sec.status] ?? "outline"}>{sec.status}</Badge>
              </DashCardHeader>
              <DashCardContent>
                <TextSmall className="leading-relaxed text-muted-foreground">{sec.description}</TextSmall>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="size-3.5" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="size-3.5" />
                    Download
                  </Button>
                  <Link href="/clients/dashboard/messages" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-auto")}>
                    <MessageSquare className="size-3.5" />
                    Ask question
                  </Link>
                </div>
              </DashCardContent>
            </DashCard>
          );
        })}
      </div>
    </PageShell>
  );
}
