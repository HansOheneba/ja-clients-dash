"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Send } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardHeader,
  DashCardTitle,
  DashCardDescription,
} from "@/components/ui/dash-card";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { H1, H2, Muted, TextSmall } from "@/components/ui/typography";
import { advisorMessageThreads } from "@/lib/data/advisor-messages";
import { cn } from "@/lib/utils";

export default function AdvisorMessagesPage() {
  const [activeThreadId, setActiveThreadId] = useState(advisorMessageThreads[0].id);
  const activeThread = advisorMessageThreads.find((t) => t.id === activeThreadId)!;
  const totalUnread = advisorMessageThreads.reduce((s, t) => s + t.unreadCount, 0);

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Messages</H1>
        <Muted>Client communication threads</Muted>
      </header>

      <KpiStrip>
        <KpiItem
          label="Threads"
          value={String(advisorMessageThreads.length)}
          change="Active conversations"
          trend="neutral"
        />
        <KpiItem
          label="Unread"
          value={String(totalUnread)}
          change="Awaiting your reply"
          trend={totalUnread > 0 ? "down" : "up"}
        />
        <KpiItem
          label="Clients"
          value={String(new Set(advisorMessageThreads.map((t) => t.clientId)).size)}
          change="In conversation"
          trend="neutral"
        />
        <KpiItem
          label="Most Recent"
          value="Today"
          change="Theo Baxter"
          trend="neutral"
        />
      </KpiStrip>

      <div className="grid min-h-[520px] grid-cols-1 gap-(--spacing-grid) lg:grid-cols-[320px_1fr]">
        {/* Thread list */}
        <DashCard className="flex flex-col overflow-hidden p-0">
          <div className="border-b border-border/60 px-4 py-3">
            <H2 className="text-sm font-semibold">Conversations</H2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {advisorMessageThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/40 last:border-0",
                  activeThreadId === thread.id && "bg-muted/60"
                )}
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-sidebar text-sidebar-foreground text-xs font-medium">
                    {thread.clientInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <TextSmall className="truncate font-medium">
                      {thread.clientName}
                    </TextSmall>
                    {thread.unreadCount > 0 && (
                      <Badge className="size-5 shrink-0 rounded-full p-0 text-[10px]">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <Muted className="truncate text-xs">{thread.lastMessage}</Muted>
                  <Muted className="text-xs">{thread.lastMessageTime}</Muted>
                </div>
              </button>
            ))}
          </div>
        </DashCard>

        {/* Active thread */}
        <DashCard className="flex flex-col overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarFallback className="bg-sidebar text-sidebar-foreground text-xs font-medium">
                  {activeThread.clientInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <TextSmall className="font-medium">{activeThread.clientName}</TextSmall>
                <Muted className="text-xs">{activeThread.subject}</Muted>
              </div>
            </div>
            <Link
              href={`/advisors/dashboard/clients/${activeThread.clientId}`}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              View profile
              <ExternalLink className="size-3" />
            </Link>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            {activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex max-w-[80%] flex-col gap-1",
                  msg.isFromAdvisor ? "ml-auto items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.isFromAdvisor
                      ? "bg-sidebar text-sidebar-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {msg.content}
                </div>
                <Muted className="px-1 text-[11px]">{msg.sentAt}</Muted>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border/60 px-4 py-3">
            <input
              type="text"
              placeholder="Type a reply..."
              className="h-9 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="icon" className="size-9 shrink-0" aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </div>
        </DashCard>
      </div>
    </PageShell>
  );
}
