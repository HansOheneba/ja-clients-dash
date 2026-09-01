"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Muted } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/client";
import type { WmMessage } from "@/lib/wealth/wm-types";
import { cn } from "@/lib/utils";

type MessageStatus = "sending" | "sent" | "failed";

type ThreadMessage = WmMessage & {
  _status?: MessageStatus;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function upsertMessage(prev: ThreadMessage[], incoming: WmMessage): ThreadMessage[] {
  if (prev.some((m) => m.id === incoming.id)) return prev;

  const pendingIdx = prev.findIndex(
    (m) =>
      m.id.startsWith("pending-") &&
      m.body === incoming.body &&
      m.sender_role === incoming.sender_role,
  );

  if (pendingIdx >= 0) {
    const next = [...prev];
    next[pendingIdx] = { ...incoming, _status: "sent" };
    return next;
  }

  return [...prev, { ...incoming, _status: "sent" }];
}

function MessageBubble({
  message,
  isOwn,
  onRetry,
}: {
  message: ThreadMessage;
  isOwn: boolean;
  onRetry?: () => void;
}) {
  const status = message._status ?? "sent";

  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm motion-reduce:animate-none",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
        isOwn
          ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
          : "rounded-bl-md bg-muted text-foreground",
        status === "sending" && "opacity-80",
        status === "failed" && "ring-1 ring-destructive/60",
      )}
    >
      <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">{message.body}</p>
      <div
        className={cn(
          "mt-1 flex items-center gap-1.5 text-xs",
          isOwn ? "justify-end text-primary-foreground/70" : "text-muted-foreground",
        )}
      >
        {status === "sending" ? (
          <>
            <Loader2 className="size-3 animate-spin" aria-hidden />
            <span>Sending</span>
          </>
        ) : null}
        {status === "failed" ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 text-destructive hover:underline"
          >
            <AlertCircle className="size-3" aria-hidden />
            Failed to send. Tap to retry
          </button>
        ) : null}
        {status === "sent" ? <time dateTime={message.created_at}>{formatTime(message.created_at)}</time> : null}
      </div>
    </div>
  );
}

export function MessageThread({
  clientId,
  ownRole,
  placeholder = "Write a message",
  className,
  onMessageSent,
}: {
  clientId: string;
  ownRole: "advisor" | "client";
  placeholder?: string;
  className?: string;
  onMessageSent?: () => void;
}) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/messages?clientId=${clientId}`);
    const data = await res.json();
    setMessages((data.messages ?? []).map((m: WmMessage) => ({ ...m, _status: "sent" as const })));
    setThreadId(data.thread?.id ?? null);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useEffect(() => {
    if (!threadId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "wealth",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const row = payload.new as WmMessage;
          setMessages((prev) => upsertMessage(prev, row));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string, existingId?: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const optimisticId = existingId ?? `pending-${crypto.randomUUID()}`;
      const optimistic: ThreadMessage = {
        id: optimisticId,
        thread_id: threadId ?? "",
        sender_role: ownRole,
        sender_id: null,
        body: trimmed,
        attachment_type: null,
        attachment_id: null,
        created_at: new Date().toISOString(),
        _status: "sending",
      };

      if (!existingId) {
        setMessages((prev) => [...prev, optimistic]);
        setBody("");
        inputRef.current?.focus();
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === existingId ? { ...m, _status: "sending" as const } : m)),
        );
      }

      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, body: trimmed }),
        });

        if (!res.ok) throw new Error("Send failed");

        const data = await res.json();
        const saved = data.message as WmMessage;

        setMessages((prev) => upsertMessage(prev, saved));
        if (data.threadId) setThreadId(data.threadId);
        onMessageSent?.();
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...m, _status: "failed" as const } : m)),
        );
      }
    },
    [clientId, onMessageSent, ownRole, threadId],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(body);
  }

  if (loading) {
    return (
      <div className={cn("flex justify-center py-12", className)}>
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("flex h-[min(520px,70vh)] flex-col rounded-xl border border-border", className)}>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <Muted className="text-center">No messages yet. Start the conversation.</Muted>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_role === ownRole}
              onRetry={
                msg._status === "failed" ? () => void sendMessage(msg.body, msg.id) : undefined
              }
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
        <Input
          ref={inputRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!body.trim()} aria-label="Send message">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
