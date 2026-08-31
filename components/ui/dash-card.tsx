import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { numericVariants } from "@/components/ui/typography";

const dashCardVariants = cva(
  "flex w-full min-w-0 flex-col rounded-(--radius-card) border border-border/60 bg-card text-card-foreground",
  {
    variants: {
      padding: {
        default: "p-6",
        sm: "p-4",
        none: "p-0",
      },
      span: {
        default: "",
        wide: "lg:col-span-2",
        full: "col-span-full",
      },
    },
    defaultVariants: {
      padding: "default",
      span: "default",
    },
  }
);

function DashCard({
  className,
  padding,
  span,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof dashCardVariants>) {
  return (
    <div
      data-slot="dash-card"
      className={cn(dashCardVariants({ padding, span }), className)}
      {...props}
    />
  );
}

function DashCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dash-card-header"
      className={cn("mb-4 flex items-start justify-between gap-4", className)}
      {...props}
    />
  );
}

function DashCardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="dash-card-title"
      className={cn("font-subheading text-h4 font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DashCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dash-card-description"
      className={cn("mt-0.5 text-body-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function DashCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dash-card-content"
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

function DashCardMetric({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dash-card-metric"
      className={cn(numericVariants(), className)}
      {...props}
    />
  );
}

export {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardMetric,
  DashCardTitle,
  dashCardVariants,
};
