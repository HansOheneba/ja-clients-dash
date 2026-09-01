"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
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

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDayLabel(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-3">
      <span className="rounded-md bg-muted/80 px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-sm">
        {label}
      </span>
    </div>
  );
}

function MessageTimeline({
  messages,
  ownRole,
  showAdvisorNames,
  onRetry,
}: {
  messages: ThreadMessage[];
  ownRole: "advisor" | "client";
  showAdvisorNames?: boolean;
  onRetry: (msg: ThreadMessage) => void;
}) {
  let lastDay: string | null = null;

  return messages.map((msg) => {
    const currentDay = dayKey(msg.created_at);
    const showDay = currentDay !== lastDay;
    lastDay = currentDay;

    return (
      <Fragment key={msg.id}>
        {showDay ? <DateSeparator label={formatDayLabel(msg.created_at)} /> : null}
        <MessageBubble
          message={msg}
          isOwn={msg.sender_role === ownRole}
          showAdvisorNames={showAdvisorNames}
          onRetry={msg._status === "failed" ? () => onRetry(msg) : undefined}
        />
      </Fragment>
    );
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
  showAdvisorNames,
  onRetry,
}: {
  message: ThreadMessage;
  isOwn: boolean;
  showAdvisorNames?: boolean;
  onRetry?: () => void;
}) {
  const status = message._status ?? "sent";
  const showName =
    showAdvisorNames && message.sender_role === "advisor" && message.sender_name;
  const timeClass = cn(
    "text-[11px] leading-none whitespace-nowrap",
    isOwn ? "text-primary-foreground/65" : "text-muted-foreground",
  );

  const timestamp = (
    <div className={cn("absolute right-0 bottom-0", timeClass)}>
      {status === "sending" ? (
        <span className="inline-flex items-center gap-1">
          <Loader2 className="size-3 animate-spin" aria-hidden />
          <span>Sending</span>
        </span>
      ) : (
        <time dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time>
      )}
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-0.5", isOwn ? "items-end" : "items-start")}>
      {showName ? (
        <span className="px-1 text-[11px] font-medium text-muted-foreground">
          {message.sender_name}
        </span>
      ) : null}
      <div
        className={cn(
          "w-fit max-w-[78%] rounded-lg px-2.5 py-1.5 text-[14.5px] leading-snug shadow-sm motion-reduce:animate-none",
          "animate-in fade-in-0 slide-in-from-bottom-1 duration-150",
          isOwn
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted text-foreground",
          status === "sending" && "opacity-80",
          status === "failed" && "ring-1 ring-destructive/60",
        )}
      >
        {status === "failed" ? (
          <div className="flex flex-col gap-1">
            <p className="whitespace-pre-wrap wrap-break-word">{message.body}</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <AlertCircle className="size-3" aria-hidden />
              Failed to send. Tap to retry
            </button>
          </div>
        ) : (
          <div className="relative max-w-full pr-11">
            <p className="whitespace-pre-wrap wrap-break-word">{message.body}</p>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageThread({
  clientId,
  ownRole,
  placeholder = "Write a message",
  className,
  showAdvisorNames = false,
  onMessageSent,
}: {
  clientId: string;
  ownRole: "advisor" | "client";
  placeholder?: string;
  className?: string;
  showAdvisorNames?: boolean;
  onMessageSent?: () => void;
}) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await fetch(`/api/messages?clientId=${clientId}`);
    const data = await res.json();
    if (!res.ok) {
      setLoadError(data.error ?? "Could not load messages");
      setMessages([]);
      setThreadId(null);
      setLoading(false);
      return;
    }
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

  if (loadError) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 p-8", className)}>
        <AlertCircle className="size-5 text-destructive" aria-hidden />
        <Muted className="text-center">{loadError}</Muted>
      </div>
    );
  }

  return (
    <div className={cn("flex h-[min(520px,70vh)] flex-col rounded-xl border border-border", className)}>
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <Muted className="text-center">No messages yet. Start the conversation.</Muted>
        ) : (
          <MessageTimeline
            messages={messages}
            ownRole={ownRole}
            showAdvisorNames={showAdvisorNames}
            onRetry={(msg) => void sendMessage(msg.body, msg.id)}
          />
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
