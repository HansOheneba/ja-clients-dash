import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { appConfig } from "@/lib/app-config";
import { cn } from "@/lib/utils";

type ClientContactActionsProps = {
  className?: string;
  primaryClassName?: string;
};

export function ClientContactActions({
  className,
  primaryClassName,
}: ClientContactActionsProps) {
  const { messages, advisor } = appConfig.routes.client;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Link
        href={messages}
        className={cn(
          buttonVariants({ size: "sm" }),
          "h-8 bg-[#0a1f3d] text-white hover:bg-[#0a1f3d]/90",
          primaryClassName,
        )}
      >
        Send a message
      </Link>
      <Link
        href={advisor}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8")}
      >
        Your advisor
      </Link>
    </div>
  );
}
