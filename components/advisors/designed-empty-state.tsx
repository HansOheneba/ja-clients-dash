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
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      {variant === "allocation" ? (
        <AllocationMark />
      ) : variant === "messages" ? (
        <MessagesMark />
      ) : (
        <TrendMark />
      )}
      <div className="flex max-w-xs flex-col gap-1">
        <TextSmall className="font-medium">{title}</TextSmall>
        <Muted className="text-[13px] leading-relaxed">{description}</Muted>
      </div>
      {action}
    </div>
  );
}
