"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { DesignedEmptyState } from "@/components/advisors/designed-empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MessageThread } from "@/components/messages/message-thread";
import { Muted, TextSmall } from "@/components/ui/typography";
import type { MessageThread as MessageThreadType } from "@/lib/wealth/wm-types";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function MessagesWorkspace() {
  const [threads, setThreads] = useState<MessageThreadType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const activeThread = threads.find((t) => t.id === activeId);

  const loadThreads = useCallback(async () => {
    const res = await fetch("/api/messages");
    const data = await res.json();
    const list = (data.threads ?? []).sort(
      (a: MessageThreadType, b: MessageThreadType) => (b.unread_count ?? 0) - (a.unread_count ?? 0),
    );
    setThreads(list);
    setActiveId((current) => current ?? list[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <DesignedEmptyState
        variant="messages"
        title="No conversations yet"
        description="Start a conversation from a client's profile. Messages appear here for clients assigned to you."
        action={
          <Link href="/advisors/dashboard/clients" className={buttonVariants({ size: "sm" })}>
            View your clients
          </Link>
        }
        className="min-h-[480px] rounded-xl border border-border"
      />
    );
  }

  return (
    <div className="grid min-h-[480px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <div className="overflow-hidden rounded-xl border border-border">
        {threads.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveId(t.id)}
            className={cn(
              "flex w-full items-center gap-3 border-b border-border/60 px-3 py-3 text-left transition-colors last:border-0",
              activeId === t.id ? "bg-muted/50" : "hover:bg-muted/30",
            )}
          >
            <Avatar size="sm">
              <AvatarFallback className="text-xs">
                {initials(t.client_name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <TextSmall className="font-medium">{t.client_name}</TextSmall>
              <Muted className="truncate text-xs">{t.last_message ?? "No messages"}</Muted>
            </div>
            {(t.unread_count ?? 0) > 0 ? (
              <Badge variant="destructive">{t.unread_count}</Badge>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex flex-col rounded-xl border border-border">
        {activeThread?.client_id ? (
          <>
            <div className="border-b border-border px-4 py-3">
              <TextSmall className="font-semibold">{activeThread.client_name}</TextSmall>
            </div>
            <MessageThread
              key={activeThread.client_id}
              clientId={activeThread.client_id}
              ownRole="advisor"
              showAdvisorNames
              placeholder="Reply to client"
              className="h-[min(480px,65vh)] border-0"
              onMessageSent={() => void loadThreads()}
            />
          </>
        ) : (
          <Muted className="p-8 text-center">Select a conversation</Muted>
        )}
      </div>
    </div>
  );
}
