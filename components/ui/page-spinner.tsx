import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type PageSpinnerProps = {
  className?: string;
  iconClassName?: string;
};

function PageSpinner({ className, iconClassName }: PageSpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center py-16", className)}
      role="status"
      aria-busy="true"
    >
      <Loader2
        className={cn("size-5 animate-spin text-muted-foreground", iconClassName)}
      />
    </div>
  );
}

export { PageSpinner };
