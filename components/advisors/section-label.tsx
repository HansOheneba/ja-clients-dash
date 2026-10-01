import { cn } from "@/lib/utils";
import { advisorSurface } from "@/components/advisors/advisor-surface";

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
      <h3 className={cn(advisorSurface.sectionTitle, "text-[0.95rem]")}>
        {children}
      </h3>
      {action}
    </div>
  );
}
