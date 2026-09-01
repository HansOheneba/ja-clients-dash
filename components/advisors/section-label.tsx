import { cn } from "@/lib/utils";
import { Overline } from "@/components/ui/typography";

export function SectionLabel({
  children,
  className,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <Overline className="tracking-[0.14em] text-muted-foreground/80">
        {children}
      </Overline>
      {action}
    </div>
  );
}
