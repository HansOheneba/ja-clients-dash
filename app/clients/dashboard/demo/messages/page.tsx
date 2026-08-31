"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashCard, DashCardContent,
} from "@/components/ui/dash-card";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { messageThreads } from "@/lib/data/messages";

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(messageThreads[0].id);
  const [draft, setDraft] = useState("");
  const active = messageThreads.find(t => t.id === activeId) ?? messageThreads[0];

  return (
    <PageShell className="flex flex-col overflow-hidden pb-0 pr-0" style={{ height: "calc(100vh - 3.5rem)" }}>
      <div className="pr-6 shrink-0">
        <H1 className="mb-1">Messages</H1>
        <Muted>Secure, logged communications with your advisor and JA Wealth team.</Muted>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border/50 bg-background">
        {/* Thread list */}
        <div className="flex w-56 shrink-0 flex-col border-r border-border/40 sm:w-64">
          <div className="flex-1 overflow-y-auto">
            {messageThreads.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className={cn(
                  "flex w-full flex-col gap-1 border-b border-border/30 px-4 py-3.5 text-left transition-colors hover:bg-muted/50",
                  t.id === activeId && "bg-muted"
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <TextSmall className="truncate font-medium">{t.name}</TextSmall>
                  <Muted className="shrink-0 text-xs">{t.time}</Muted>
                </div>
                <div className="flex items-center gap-2">
                  <Muted className="flex-1 truncate text-xs">{t.preview}</Muted>
                  {t.unreadCount ? (
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[9px] font-bold text-white">
                      {t.unreadCount}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border/40 px-5 py-3.5 shrink-0">
            <div>
              <TextSmall className="font-medium">{active.name}</TextSmall>
              <Muted className="capitalize text-xs">{active.type}</Muted>
            </div>
            {active.unreadCount ? (
              <Badge className="ml-auto">{active.unreadCount} unread</Badge>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4">
              {active.messages.map(msg => (
                <div key={msg.id} className={cn("flex", msg.isOwn && "justify-end")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[75%]",
                    msg.isOwn ? "rounded-br-sm bg-brand-primary text-white" : "rounded-bl-sm bg-muted"
                  )}>
                    {!msg.isOwn && (
                      <TextSmall className="mb-0.5 font-medium">{msg.sender}</TextSmall>
                    )}
                    <TextSmall className={cn("leading-relaxed", msg.isOwn && "text-white/95")}>
                      {msg.content}
                    </TextSmall>
                    <Muted className={cn("mt-1 text-xs", msg.isOwn && "text-white/60")}>
                      {msg.time}
                    </Muted>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {active.type === "advisor" && (
            <div className="shrink-0 border-t border-border/40 px-4 py-3 sm:px-5">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && draft.trim()) setDraft(""); }}
                  className="flex-1"
                />
                <Button size="icon" disabled={!draft.trim()} onClick={() => setDraft("")}>
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
