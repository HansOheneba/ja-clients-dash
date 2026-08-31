"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TextSmall, Muted } from "@/components/ui/typography";
import {
  CELEREY_ICON_SRC,
  CELEREY_WELCOME,
  createMessage,
  type ChatMessage,
  type PromptChip,
} from "@/lib/data/celerey";
import { cn } from "@/lib/utils";

type CelereyChatProps = {
  audience: "client" | "advisor";
  promptChips: PromptChip[];
  initialQuery?: string;
  clientId?: string;
};

function CelereyAvatar({ className }: { className?: string }) {
  return (
    <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar", className)}>
      <Image
        src={CELEREY_ICON_SRC}
        alt="Celerey"
        width={20}
        height={20}
        className="size-5 object-contain"
      />
    </div>
  );
}

function formatMarkdownLite(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

function toHistory(conversation: ChatMessage[]) {
  return conversation
    .filter((msg) => !(msg.role === "assistant" && msg.content === CELEREY_WELCOME))
    .slice(-20)
    .map((msg) => ({ role: msg.role, content: msg.content }));
}

async function readSseDeltas(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;

      let parsed: { delta?: string; error?: string };
      try {
        parsed = JSON.parse(data) as typeof parsed;
      } catch {
        continue;
      }
      if (parsed.error) throw new Error(parsed.error);
      if (parsed.delta) onDelta(parsed.delta);
    }
  }
}

function CelereyChat({ audience, promptChips, initialQuery, clientId }: CelereyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage("assistant", CELEREY_WELCOME),
  ]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const busy = thinking || Boolean(streamingId);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const startNewChat = () => {
    abortRef.current?.abort();
    setMessages([createMessage("assistant", CELEREY_WELCOME)]);
    setDraft("");
    setThinking(false);
    setStreamingId(null);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requestReply = async (conversation: ChatMessage[]) => {
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setThinking(true);
    setStreamingId(null);

    let assistantId: string | null = null;
    let pending = "";
    let frame = 0;

    const flush = (id: string) => {
      if (!pending) return;
      const add = pending;
      pending = "";
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, content: msg.content + add } : msg)),
      );
    };

    const appendDelta = (delta: string) => {
      if (!assistantId) {
        const reply = createMessage("assistant", delta);
        assistantId = reply.id;
        setMessages((prev) => [...prev, reply]);
        setStreamingId(reply.id);
        setThinking(false);
        return;
      }

      pending += delta;
      if (frame) return;
      const id = assistantId;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        flush(id);
      });
    };

    try {
      const res = await fetch("/api/celerey/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toHistory(conversation),
          clientId: audience === "advisor" ? clientId : undefined,
        }),
        signal: abort.signal,
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok || !contentType.includes("text/event-stream") || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Celerey could not reply.");
      }

      await readSseDeltas(res.body, appendDelta);
      if (assistantId) {
        if (frame) window.cancelAnimationFrame(frame);
        flush(assistantId);
      }
      if (!assistantId) {
        throw new Error("Celerey returned an empty reply.");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const fallback =
        err instanceof Error ? err.message : "Celerey could not complete that request.";
      if (assistantId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId && !msg.content
              ? { ...msg, content: `I could not complete that request. ${fallback}` }
              : msg,
          ),
        );
      } else {
        setMessages((prev) => [
          ...prev,
          createMessage(
            "assistant",
            `I could not complete that request. ${fallback} Try again, or ask your advisor if this keeps happening.`,
          ),
        ]);
      }
    } finally {
      if (frame) window.cancelAnimationFrame(frame);
      if (abortRef.current === abort) {
        setThinking(false);
        setStreamingId(null);
      }
    }
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg = createMessage("user", trimmed);
    const next = [...messages, userMsg];
    setMessages(next);
    setDraft("");
    void requestReply(next);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking, streamingId]);

  useEffect(() => {
    if (!initialQuery || initialSent.current) return;
    initialSent.current = true;
    const trimmed = initialQuery.trim();
    if (!trimmed) return;

    const userMsg = createMessage("user", trimmed);
    const next = [createMessage("assistant", CELEREY_WELCOME), userMsg];
    setMessages(next);
    void requestReply(next);
  }, [initialQuery]);

  const showStarters = messages.length <= 1 && !busy;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-end border-b border-border/40 px-4 py-2 sm:px-6">
        <Button variant="outline" size="sm" onClick={startNewChat}>
          <SquarePen className="size-4" />
          New chat
        </Button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && <CelereyAvatar />}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[78%]",
                  msg.role === "user"
                    ? "rounded-br-md bg-sidebar text-sidebar-foreground"
                    : "rounded-bl-md border border-border/50 bg-card text-foreground shadow-sm"
                )}
              >
                <TextSmall className={cn("leading-relaxed", msg.role === "user" && "text-sidebar-foreground")}>
                  {formatMarkdownLite(msg.content)}
                  {msg.id === streamingId ? (
                    <span
                      aria-hidden
                      className="ml-0.5 inline-block h-[1em] w-px translate-y-px bg-foreground motion-reduce:hidden animate-pulse"
                    />
                  ) : null}
                </TextSmall>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3">
              <CelereyAvatar />
              <div className="rounded-2xl rounded-bl-md border border-border/50 bg-card px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {showStarters && (
            <div className="flex flex-col gap-3 pt-2">
              <Muted className="text-center text-xs">Suggested questions</Muted>
              <div className="flex flex-wrap justify-center gap-2">
                {promptChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => sendMessage(chip.query)}
                    className="rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-brand-accent/40 hover:bg-muted/60"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border/50 bg-background/80 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          <div className="relative flex items-end gap-2 rounded-2xl border border-border/60 bg-card px-3 py-2 shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(draft);
                }
              }}
              placeholder={
                audience === "advisor"
                  ? "Ask about your book, a client file, or the next review..."
                  : "Ask Celerey anything about your wealth, goals, or legacy..."
              }
              rows={1}
              className="max-h-32 min-h-[44px] resize-none border-0 bg-transparent px-1 py-2.5 shadow-none focus-visible:ring-0"
            />
            <Button
              size="icon"
              className="mb-0.5 shrink-0 rounded-xl"
              disabled={!draft.trim() || busy}
              onClick={() => sendMessage(draft)}
              aria-label="Send message"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
          <Muted className="text-center text-[11px]">
            Celerey can make mistakes. Confirm important answers with your advisor or wealth manager.
          </Muted>
        </div>
      </div>
    </div>
  );
}

export { CelereyChat };
