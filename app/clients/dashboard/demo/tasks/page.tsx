"use client";

import { useState } from "react";
import {
  CheckCircle2, Clock, FileText, Upload, UserCheck, type LucideIcon,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashCard, DashCardContent, DashCardHeader, DashCardTitle,
} from "@/components/ui/dash-card";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { tasks, type TaskStatus, type TaskType } from "@/lib/data/tasks";

const TYPE_ICON: Record<TaskType, LucideIcon> = {
  upload:      Upload,
  approve:     UserCheck,
  information: FileText,
  confirm:     CheckCircle2,
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:   { label: "Pending",   variant: "outline"    },
  overdue:   { label: "Overdue",   variant: "destructive" },
  completed: { label: "Completed", variant: "secondary"  },
};

export default function TasksPage() {
  const [done, setDone] = useState<Set<string>>(
    new Set(tasks.filter(t => t.status === "completed").map(t => t.id))
  );

  const pending   = tasks.filter(t => !done.has(t.id));
  const completed = tasks.filter(t => done.has(t.id));

  function markDone(id: string) { setDone(p => new Set(p).add(id)); }
  function unmark(id: string) { setDone(p => { const s = new Set(p); s.delete(id); return s; }); }

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Tasks</H1>
        <Muted>{pending.length} pending · complete these to unlock advisor action.</Muted>
      </header>

      <div className="flex flex-col gap-(--spacing-grid)">
        {pending.map(task => {
          const Icon = TYPE_ICON[task.type];
          const cfg  = STATUS_CONFIG[task.status];
          return (
            <DashCard key={task.id}>
              <DashCardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    task.status === "overdue" ? "bg-destructive/10" : "bg-brand-primary/10"
                  )}>
                    <Icon className={cn("size-5", task.status === "overdue" ? "text-destructive" : "text-brand-primary")} />
                  </div>
                  <div>
                    <DashCardTitle>{task.title}</DashCardTitle>
                    <Muted>Raised by {task.raisedBy}</Muted>
                  </div>
                </div>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
              </DashCardHeader>
              <DashCardContent>
                <TextSmall className="text-muted-foreground">{task.description}</TextSmall>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" />
                    <Muted>Due {task.deadline}</Muted>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.type === "upload" && (
                      <Button size="sm" variant="outline">
                        <Upload className="size-3.5" />
                        Upload
                      </Button>
                    )}
                    {task.type === "approve" && (
                      <Button size="sm" variant="outline">
                        <UserCheck className="size-3.5" />
                        View and approve
                      </Button>
                    )}
                    <Button size="sm" onClick={() => markDone(task.id)}>
                      <CheckCircle2 className="size-3.5" />
                      Mark complete
                    </Button>
                  </div>
                </div>
              </DashCardContent>
            </DashCard>
          );
        })}
      </div>

      {completed.length > 0 && (
        <DashCard>
          <DashCardHeader>
            <DashCardTitle className="text-muted-foreground">Completed ({completed.length})</DashCardTitle>
          </DashCardHeader>
          <DashCardContent className="p-0">
            <div className="divide-y divide-border/40">
              {completed.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-6 py-3">
                  <CheckCircle2 className="size-4 shrink-0 text-brand-accent" />
                  <div className="min-w-0 flex-1">
                    <TextSmall className="line-through text-muted-foreground truncate">{task.title}</TextSmall>
                    <Muted>{task.raisedBy}</Muted>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => unmark(task.id)}>
                    Undo
                  </Button>
                </div>
              ))}
            </div>
          </DashCardContent>
        </DashCard>
      )}

      {pending.length === 0 && (
        <DashCard className="border-brand-accent/30 bg-brand-accent/5">
          <DashCardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <CheckCircle2 className="size-10 text-brand-accent" />
            <TextSmall className="font-medium">All tasks complete</TextSmall>
            <Muted>You are fully up to date. Your advisor will be notified.</Muted>
          </DashCardContent>
        </DashCard>
      )}
    </PageShell>
  );
}
