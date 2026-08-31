"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Flag,
  Gift,
  Globe,
  GraduationCap,
  HeartHandshake,
  Landmark,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Shield,
  StickyNote,
  Trash2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TextSmall } from "@/components/ui/typography";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { appConfig } from "@/lib/app-config";
import type { Goal, GoalStatus } from "@/lib/data/goals";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Landmark,
  GraduationCap,
  Building2,
  Globe,
  HeartHandshake,
  Shield,
  TrendingUp,
  Gift,
  Flag,
};

const STATUS_CONFIG: Record<
  GoalStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  "on-track": { label: "On track", variant: "secondary" },
  ahead: { label: "Ahead", variant: "secondary" },
  "at-risk": { label: "At risk", variant: "destructive" },
  "in-progress": { label: "In progress", variant: "outline" },
};

const PROBABILITY_TONE: Record<string, string> = {
  high: "text-green-600 dark:text-green-400",
  mid: "text-amber-600 dark:text-amber-400",
  low: "text-red-500 dark:text-red-400",
};

type GoalCardProps = {
  goal: Goal;
  variant: "client" | "advisor";
  formatValue: (usd: number, opts?: { compact?: boolean }) => string;
  /** Advisor only: opens edit sheet (provided by AdvisorGoalCard wrapper). */
  onEdit?: () => void;
  /** Advisor only: remove this goal. */
  onRemove?: () => void;
};

function GoalCard({ goal, variant, formatValue, onEdit, onRemove }: GoalCardProps) {
  const [noteOpen, setNoteOpen] = useState(false);

  const cfg = STATUS_CONFIG[goal.status];
  const GoalIcon = ICON_MAP[goal.iconName] ?? Landmark;
  const pct =
    goal.targetUSD > 0
      ? Math.min(100, Math.round((goal.currentUSD / goal.targetUSD) * 100))
      : 0;
  const probTone =
    goal.probabilityPct >= 80 ? PROBABILITY_TONE.high
    : goal.probabilityPct >= 65 ? PROBABILITY_TONE.mid
    : PROBABILITY_TONE.low;

  return (
    <>
      <div className={cn(dashboardTheme.kpiTile, "flex flex-col gap-2.5 px-4 py-3.5")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <GoalIcon className="size-4 text-brand-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">{goal.name}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {goal.category}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Goal actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setNoteOpen(true)}>
                <StickyNote className="size-4" />
                Advisor note
              </DropdownMenuItem>

              {variant === "client" ? (
                <DropdownMenuItem render={<Link href={appConfig.routes.client.messages} />}>
                  <MessageSquare className="size-4" />
                  Request goal review
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="size-4" />
                    Edit goal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onRemove}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <p className="text-lg font-bold tabular-nums tracking-tight">{pct}%</p>
          <p className="text-[11px] text-muted-foreground">
            {formatValue(goal.currentUSD, { compact: true })} of{" "}
            {formatValue(goal.targetUSD, { compact: true })}
            {goal.targetDate !== "Ongoing" && ` · ${goal.targetDate}`}
          </p>
        </div>

        <Progress
          value={pct}
          className={cn("h-1.5", goal.status === "at-risk" && "[&>div]:bg-destructive")}
        />

        <div className="flex items-center justify-between gap-2">
          <Badge variant={cfg.variant} className="text-[10px]">
            {cfg.label}
          </Badge>
          <TextSmall className={cn("text-[11px] font-numeric font-semibold", probTone)}>
            {goal.probabilityPct}% likely
          </TextSmall>
        </div>
      </div>

      <Sheet open={noteOpen} onOpenChange={setNoteOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Advisor note</SheetTitle>
            <SheetDescription>{goal.name}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <TextSmall className="leading-relaxed text-muted-foreground">
              {goal.advisorNote}
            </TextSmall>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export { GoalCard };
