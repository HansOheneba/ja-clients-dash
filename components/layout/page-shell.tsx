import { cn } from "@/lib/utils";

function PageShell({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "w-full px-(--spacing-page-x) py-(--spacing-section)",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function PageSection({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("flex w-full flex-col gap-(--spacing-grid)", className)}
      {...props}
    >
      {children}
    </section>
  );
}

function DashboardGrid({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-(--spacing-grid) auto-rows-auto lg:grid-cols-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { DashboardGrid, PageSection, PageShell };
