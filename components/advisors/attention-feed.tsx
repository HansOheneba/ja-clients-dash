"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  FileWarning,
  MessageSquare,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

import { Muted, TextSmall } from "@/components/ui/typography";
import type { AttentionItem, AttentionItemType } from "@/lib/wealth/wm-types";
import { cn } from "@/lib/utils";

const ICONS: Record<AttentionItemType, typeof Calendar> = {
  session_request: Calendar,
  document_request: FileText,
  document_expiry: AlertCircle,
  message: MessageSquare,
  review_due: ClipboardList,
  recap_backlog: Calendar,
  report_due: FileWarning,
};

export function AttentionFeed({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center">
        <Muted>Nothing needs your attention right now.</Muted>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {items.map((item, i) => {
        const Icon = ICONS[item.type];
        const content = (
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              i < items.length - 1 && "border-b border-border/60",
            )}
          >
            <Icon className="size-4 shrink-0 text-destructive" />
            <TextSmall className="min-w-0 flex-1">{item.title}</TextSmall>
            <Muted className="shrink-0 text-xs">
              {new Date(item.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </Muted>
          </div>
        );
        return item.href ? (
          <Link key={item.id} href={item.href} className="block transition-colors hover:bg-muted/40">
            {content}
          </Link>
        ) : (
          <div key={item.id}>{content}</div>
        );
      })}
    </div>
  );
}
