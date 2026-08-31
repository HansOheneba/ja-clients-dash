"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { CelereyChat } from "@/components/celerey/celerey-chat";
import { PageShell } from "@/components/layout/page-shell";
import { H1, Muted } from "@/components/ui/typography";
import { clientPromptChips } from "@/lib/data/celerey";

function AskCelereyContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? undefined;

  return (
    <PageShell
      className="flex h-[calc(100vh-3.5rem)] flex-col gap-0 overflow-hidden py-0"
      style={{ paddingBottom: 0 }}
    >
      <header className="shrink-0 border-b border-border/40 px-(--spacing-page-x) py-4">
        <H1>Ask Celerey</H1>
        <Muted>Your private wealth assistant for portfolio, goals, and legacy questions.</Muted>
      </header>
      <CelereyChat
        audience="client"
        promptChips={clientPromptChips}
        initialQuery={initialQuery}
      />
    </PageShell>
  );
}

export default function AskCelereyPage() {
  return (
    <Suspense>
      <AskCelereyContent />
    </Suspense>
  );
}
