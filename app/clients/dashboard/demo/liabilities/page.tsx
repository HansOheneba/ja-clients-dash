"use client";

import Link from "next/link";
import { AlertTriangle, TrendingDown } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/lib/currency-context";
import { liabilities, liabilitySummary, type LiabilityStatus, type LiabilityType } from "@/lib/data/liabilities";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<LiabilityType, string> = {
  "mortgage":        "Mortgage",
  "personal-loan":   "Personal loan",
  "credit-facility": "Credit facility",
  "business-loan":   "Business loan",
};

const STATUS_CONFIG: Record<LiabilityStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  "current":            { label: "Current",            variant: "secondary"  },
  "attention-required": { label: "Attention required", variant: "destructive" },
};

export default function LiabilitiesPage() {
  const { format } = useCurrency();

  const { totalAssetValueUSD, totalOutstandingUSD, monthlyDebtServiceUSD } = liabilitySummary;
  const netWorthUSD = totalAssetValueUSD - totalOutstandingUSD;
  const debtToAssetPct = Math.round((totalOutstandingUSD / totalAssetValueUSD) * 100);
  const attentionCount = liabilities.filter(l => l.status === "attention-required").length;

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Liabilities</H1>
        <Muted>Your outstanding obligations and debt profile. Managed alongside your asset portfolio.</Muted>
      </header>

      <KpiStrip>
        <KpiItem
          label="Total Outstanding"
          value={format(totalOutstandingUSD)}
          change={`${debtToAssetPct}% of total assets`}
          trend="neutral"
        />
        <KpiItem
          label="Net Worth"
          value={format(netWorthUSD)}
          change="Assets minus liabilities"
          trend="up"
          emphasis="primary"
        />
        <KpiItem
          label="Monthly Debt Service"
          value={format(monthlyDebtServiceUSD)}
          change="Total monthly obligations"
          trend="neutral"
        />
        <KpiItem
          label="Debt-to-Asset Ratio"
          value={`${debtToAssetPct}%`}
          change={debtToAssetPct < 20 ? "Healthy" : debtToAssetPct < 35 ? "Moderate" : "Review recommended"}
          trend={debtToAssetPct < 20 ? "up" : debtToAssetPct < 35 ? "neutral" : "down"}
        />
      </KpiStrip>

      {/* Debt-to-asset visual */}
      <DashCard>
        <DashCardHeader>
          <div>
            <DashCardTitle>Balance Sheet Overview</DashCardTitle>
            <DashCardDescription>Assets vs liabilities as a proportion of net worth</DashCardDescription>
          </div>
          <TrendingDown className="size-4 text-muted-foreground" />
        </DashCardHeader>
        <DashCardContent>
          <div className="mb-2 flex justify-between">
            <div>
              <Muted>Total assets</Muted>
              <TextSmall className="font-medium font-numeric">{format(totalAssetValueUSD)}</TextSmall>
            </div>
            <div className="text-right">
              <Muted>Total liabilities</Muted>
              <TextSmall className="font-medium font-numeric">{format(totalOutstandingUSD)}</TextSmall>
            </div>
          </div>
          <div className="relative h-4 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-brand-primary"
              style={{ width: `${100 - debtToAssetPct}%` }}
            />
            <div
              className="absolute inset-y-0 right-0 rounded-full bg-destructive/60"
              style={{ width: `${debtToAssetPct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-brand-primary" />
              <Muted>Net worth ({100 - debtToAssetPct}%)</Muted>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-destructive/60" />
              <Muted>Liabilities ({debtToAssetPct}%)</Muted>
            </div>
          </div>
        </DashCardContent>
      </DashCard>

      {attentionCount > 0 && (
        <DashCard className="border-amber-200 bg-amber-50/50">
          <DashCardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <DashCardTitle>Attention required</DashCardTitle>
            </div>
            <Badge variant="outline" className="border-amber-400 text-amber-700">{attentionCount} item{attentionCount > 1 ? "s" : ""}</Badge>
          </DashCardHeader>
          <DashCardContent>
            {liabilities.filter(l => l.status === "attention-required").map(l => (
              <div key={l.id}>
                <TextSmall className="font-medium">{l.name}</TextSmall>
                <TextSmall className="text-muted-foreground">{l.notes}</TextSmall>
              </div>
            ))}
            <Link
              href="/clients/dashboard/demo/sessions"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3")}
            >
              Book a review session
            </Link>
          </DashCardContent>
        </DashCard>
      )}

      {/* Individual liabilities */}
      <div className="flex flex-col gap-(--spacing-grid)">
        {liabilities.map(l => {
          const cfg = STATUS_CONFIG[l.status];
          const repaidPct = Math.round(((l.originalAmountUSD - l.outstandingUSD) / l.originalAmountUSD) * 100);
          return (
            <DashCard key={l.id}>
              <DashCardHeader>
                <div>
                  <DashCardTitle>{l.name}</DashCardTitle>
                  <DashCardDescription>{l.lender} · {TYPE_LABEL[l.type]}</DashCardDescription>
                </div>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
              </DashCardHeader>
              <DashCardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <Muted>Outstanding</Muted>
                    <TextSmall className="font-medium font-numeric">{format(l.outstandingUSD)}</TextSmall>
                  </div>
                  <div>
                    <Muted>Interest rate</Muted>
                    <TextSmall className="font-medium font-numeric">{l.interestRatePct}% p.a.</TextSmall>
                  </div>
                  <div>
                    <Muted>Monthly payment</Muted>
                    <TextSmall className="font-medium font-numeric">
                      {l.monthlyPaymentUSD > 0 ? format(l.monthlyPaymentUSD) : "Interest only"}
                    </TextSmall>
                  </div>
                  <div>
                    <Muted>Maturity</Muted>
                    <TextSmall className="font-medium">{l.maturityDate}</TextSmall>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between">
                    <Muted>Repaid</Muted>
                    <Muted>{repaidPct}%</Muted>
                  </div>
                  <Progress value={repaidPct} className="h-1.5" />
                  <div className="flex justify-between">
                    <Muted>{format(l.originalAmountUSD - l.outstandingUSD)} repaid</Muted>
                    <Muted>{format(l.outstandingUSD)} remaining</Muted>
                  </div>
                </div>

                {l.notes && (
                  <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2.5">
                    <TextSmall className="text-muted-foreground">{l.notes}</TextSmall>
                  </div>
                )}
              </DashCardContent>
            </DashCard>
          );
        })}
      </div>
    </PageShell>
  );
}
