"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { AddTaskSheet } from "@/components/advisors/add-task-sheet";
import { PageShell } from "@/components/layout/page-shell";
import {
  DashCard,
  DashCardContent,
  DashCardHeader,
  DashCardTitle,
  DashCardDescription,
} from "@/components/ui/dash-card";
import { Badge } from "@/components/ui/badge";
import { H1, TextSmall, Muted } from "@/components/ui/typography";
import { DashboardGrid } from "@/components/layout/page-shell";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { advisorTasks } from "@/lib/data/advisor-tasks";
import { cn } from "@/lib/utils";

const priorityVariant: Record<string, "default" | "secondary" | "outline"> = {
  High: "default",
  Medium: "secondary",
  Low: "outline",
};

export default function AdvisorTasksPage() {
  const open = advisorTasks.filter((t) => !t.done);
  const done = advisorTasks.filter((t) => t.done);
  const highPriority = open.filter((t) => t.priority === "High");
  const dueSoon = open.filter((t) => {
    const [day, month, year] = t.due.split(" ");
    const due = new Date(`${month} ${day} ${year}`);
    const today = new Date("2026-06-16");
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <H1>Tasks</H1>
          <Muted>
            {open.length} open, {done.length} completed
          </Muted>
        </div>
        <AddTaskSheet />
      </header>

      <KpiStrip>
        <KpiItem
          label="Open Tasks"
          value={String(open.length)}
          change="Across all clients"
          trend="neutral"
        />
        <KpiItem
          label="High Priority"
          value={String(highPriority.length)}
          change="Requires immediate attention"
          trend={highPriority.length > 0 ? "down" : "up"}
        />
        <KpiItem
          label="Due This Week"
          value={String(dueSoon.length)}
          change="Next 7 days"
          trend={dueSoon.length > 3 ? "down" : "neutral"}
        />
        <KpiItem
          label="Completed"
          value={String(done.length)}
          change="This period"
          trend="up"
        />
      </KpiStrip>

      <DashboardGrid>
        <DashCard span="full">
          <DashCardHeader>
            <div>
              <DashCardTitle>Open Tasks</DashCardTitle>
              <DashCardDescription>Sorted by priority and due date</DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent className="gap-3">
            {open.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <TextSmall className="font-medium">{task.title}</TextSmall>
                    {task.clientId && (
                      <Link
                        href={`/advisors/dashboard/clients/${task.clientId}`}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`View ${task.clientName}`}
                      >
                        <ExternalLink className="size-3" />
                      </Link>
                    )}
                  </div>
                  <Muted>
                    Due {task.due} · {task.category}
                    {task.clientName ? ` · ${task.clientName}` : ""}
                  </Muted>
                </div>
                <Badge
                  variant={priorityVariant[task.priority]}
                  className="shrink-0"
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </DashCardContent>
        </DashCard>

        {done.length > 0 && (
          <DashCard span="full">
            <DashCardHeader>
              <DashCardTitle>Completed</DashCardTitle>
            </DashCardHeader>
            <DashCardContent className="gap-3">
              {done.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <TextSmall className="flex-1 text-muted-foreground line-through">
                    {task.title}
                  </TextSmall>
                  <Muted className="shrink-0">{task.due}</Muted>
                </div>
              ))}
            </DashCardContent>
          </DashCard>
        )}
      </DashboardGrid>
    </PageShell>
  );
}
