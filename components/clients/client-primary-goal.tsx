"use client";

import Link from "next/link";

import { ClientEmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { TextSmall } from "@/components/ui/typography";
import { useCurrency } from "@/lib/currency-context";
import type { Goal } from "@/lib/data/goals";
import { cn } from "@/lib/utils";

export function ClientPrimaryGoal({ goal }: { goal: Goal | null }) {
  const { format } = useCurrency();

  if (!goal) {
    return (
      <section>
        <p className="mb-2 text-sm font-medium">Primary goal</p>
        <div className="rounded-xl border border-border/40 bg-card">
          <ClientEmptyState
            variant="goals"
            compact
            title="No goals yet"
            description="Your wealth manager will add goals to your plan shortly."
            action={
              <Link href="/clients/dashboard/goals" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                View My Plan
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const progress =
    goal.targetUSD > 0 ? Math.min(100, Math.round((goal.currentUSD / goal.targetUSD) * 100)) : 0;

  return (
    <section>
      <p className="mb-2 text-sm font-medium">{goal.name}</p>
      <div className="rounded-xl border border-border/40 bg-card px-4 py-4">
        <div className="mb-2 flex justify-between">
          <TextSmall className="text-muted-foreground">
            {format(goal.currentUSD)} of {format(goal.targetUSD)} target
          </TextSmall>
          <TextSmall className="text-muted-foreground">{progress}%</TextSmall>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#c9a227]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

export function ClientLatestReport({
  report,
}: {
  report: { id: string; name: string; date: string; downloadUrl: string } | null;
}) {
  if (!report) {
    return (
      <section>
        <p className="mb-2 text-sm font-medium">Latest report</p>
        <div className="rounded-xl border border-border/40 bg-card px-4 py-4">
          <TextSmall className="text-muted-foreground">
            Your wealth manager will publish statements here when ready.
          </TextSmall>
        </div>
      </section>
    );
  }

  return (
    <section>
      <p className="mb-2 text-sm font-medium">Latest report</p>
      <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-3.5 py-3">
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm">{report.name}</p>
          <TextSmall className="text-muted-foreground">Sent {report.date}</TextSmall>
        </div>
        <a href={report.downloadUrl} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 shrink-0 text-xs")}>
          View
        </a>
      </div>
    </section>
  );
}
