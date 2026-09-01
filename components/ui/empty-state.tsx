import { cn } from "@/lib/utils";
import { Muted, TextSmall } from "@/components/ui/typography";

function AllocationMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("size-14", className)}
      aria-hidden
    >
      <circle
        cx="32"
        cy="32"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        className="text-brand-primary/15"
      />
      <circle
        cx="32"
        cy="32"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeDasharray="42 84"
        strokeLinecap="round"
        className="text-brand-accent/50"
      />
      <circle
        cx="32"
        cy="32"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeDasharray="18 108"
        strokeDashoffset="-44"
        strokeLinecap="round"
        className="text-brand-primary/35"
      />
    </svg>
  );
}

function TrendMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 48"
      className={cn("h-10 w-20", className)}
      aria-hidden
    >
      <path
        d="M4 40 C 18 36, 24 16, 38 22 S 62 8, 92 14 L 92 44 L 4 44 Z"
        className="fill-brand-primary/6"
      />
      <path
        d="M4 40 C 18 36, 24 16, 38 22 S 62 8, 92 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-brand-primary/35"
      />
    </svg>
  );
}

function MessagesMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-14", className)} aria-hidden>
      <rect
        x="10"
        y="14"
        width="36"
        height="28"
        rx="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-brand-primary/20"
      />
      <path
        d="M18 26h20M18 32h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-brand-primary/35"
      />
      <path
        d="M38 34l14 8V22a6 6 0 0 0-6-6H38"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        className="text-brand-accent/50"
      />
    </svg>
  );
}

function CalendarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-14", className)} aria-hidden>
      <rect
        x="12"
        y="16"
        width="40"
        height="32"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-brand-primary/20"
      />
      <path
        d="M12 26h40M22 12v8M42 12v8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-brand-primary/35"
      />
    </svg>
  );
}

function DocumentMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-14", className)} aria-hidden>
      <path
        d="M20 12h16l12 12v28a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        className="text-brand-primary/20"
      />
      <path
        d="M36 12v12h12M24 34h16M24 42h12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-brand-primary/35"
      />
    </svg>
  );
}

function GoalMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-14", className)} aria-hidden>
      <circle
        cx="32"
        cy="32"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-brand-primary/20"
      />
      <circle cx="32" cy="32" r="6" className="fill-brand-accent/50" />
      <path
        d="M32 14v6M32 44v6M14 32h6M44 32h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-brand-primary/25"
      />
    </svg>
  );
}

export type EmptyStateVariant =
  | "allocation"
  | "trend"
  | "messages"
  | "sessions"
  | "documents"
  | "goals";

export function ClientEmptyState({
  variant,
  title,
  description,
  action,
  className,
  compact,
}: {
  variant: EmptyStateVariant;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const Mark =
    variant === "allocation"
      ? AllocationMark
      : variant === "messages"
        ? MessagesMark
        : variant === "sessions"
          ? CalendarMark
          : variant === "documents"
            ? DocumentMark
            : variant === "goals"
              ? GoalMark
              : TrendMark;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 text-center",
        compact ? "py-6" : "min-h-[220px] py-10",
        className,
      )}
    >
      <Mark />
      <div className="flex max-w-xs flex-col gap-1">
        <TextSmall className="font-medium">{title}</TextSmall>
        <Muted className="text-[13px] leading-relaxed">{description}</Muted>
      </div>
      {action}
    </div>
  );
}

/** @deprecated Use ClientEmptyState from @/components/ui/empty-state */
export function DesignedEmptyState({
  variant,
  title,
  description,
  action,
  className,
}: {
  variant: "allocation" | "trend" | "messages";
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <ClientEmptyState
      variant={variant}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}

export function isPortfolioEmpty(data: {
  totalUSD: number;
  buckets: { totalUSD: number }[];
  history: { value: number }[];
} | null): boolean {
  if (!data) return true;
  const hasBucketValue = data.buckets.some((b) => b.totalUSD > 0);
  const hasHistory = data.history.some((h) => h.value > 0);
  return data.totalUSD <= 0 && !hasBucketValue && !hasHistory;
}
