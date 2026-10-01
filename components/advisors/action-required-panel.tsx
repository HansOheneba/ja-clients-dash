import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  FileText,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import { Muted, TextSmall } from "@/components/ui/typography";
import type { AttentionGroup } from "@/lib/wealth/wm-types";
import { cn } from "@/lib/utils";

function countLabel(group: AttentionGroup) {
  if (group.key === "messages") {
    return `${group.count} ${group.count === 1 ? "message" : "messages"}`;
  }
  return `${group.count} ${group.count === 1 ? "client" : "clients"}`;
}

function groupVisual(group: AttentionGroup): {
  Icon: LucideIcon;
  row: string;
  icon: string;
} {
  if (group.urgent) {
    return {
      Icon: ClipboardList,
      row: "bg-destructive/8 hover:bg-destructive/12",
      icon: "bg-destructive/15 text-destructive",
    };
  }
  if (group.key.includes("statements")) {
    return {
      Icon: FileText,
      row: "bg-[#b2936b]/12 hover:bg-[#b2936b]/18",
      icon: "bg-[#b2936b]/25 text-[#8a6f45]",
    };
  }
  if (group.key === "session-requests" || group.key === "recaps") {
    return {
      Icon: Calendar,
      row: "bg-[#202356]/6 hover:bg-[#202356]/10",
      icon: "bg-[#202356]/12 text-brand-primary",
    };
  }
  if (group.key === "messages") {
    return {
      Icon: MessageSquare,
      row: "bg-[#829850]/10 hover:bg-[#829850]/16",
      icon: "bg-[#829850]/20 text-[#5f7340]",
    };
  }
  return {
    Icon: ClipboardList,
    row: "bg-[#c4b5a0]/18 hover:bg-[#c4b5a0]/28",
    icon: "bg-[#c4b5a0]/35 text-[#6e6254]",
  };
}

export function ActionRequiredPanel({
  total,
  groups,
}: {
  total: number;
  groups: AttentionGroup[];
}) {
  if (total === 0 || groups.length === 0) {
    return (
      <div className="rounded-lg bg-white/70 px-3 py-4 text-center">
        <Muted className="text-[12px]">
          Nothing requires attention across your book right now.
        </Muted>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {groups.map((group) => {
        const visual = groupVisual(group);
        const Icon = visual.Icon;
        return (
          <Link
            key={group.key}
            href={group.href}
            className={cn(
              "group flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 transition-colors",
              visual.row,
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md",
                  visual.icon,
                )}
              >
                <Icon className="size-3" />
              </span>
              <div className="min-w-0">
                <TextSmall className="text-[12px] font-medium text-foreground">
                  {group.label}
                </TextSmall>
                <Muted className="text-[11px]">{countLabel(group)}</Muted>
              </div>
            </div>
            <span className="shrink-0 text-[11px] font-medium text-brand-primary/80 transition-colors group-hover:text-brand-primary">
              View →
            </span>
          </Link>
        );
      })}
    </div>
  );
}
