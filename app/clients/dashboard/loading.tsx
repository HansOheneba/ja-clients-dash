import { PageShell } from "@/components/layout/page-shell";

export default function ClientDashboardLoading() {
  return (
    <PageShell className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-40 animate-pulse rounded bg-muted/50" />
        <div className="h-3 w-56 animate-pulse rounded bg-muted/40" />
      </div>
      <div className="h-[120px] animate-pulse rounded-xl bg-muted/50" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-[148px] animate-pulse rounded-xl bg-muted/50" />
        <div className="h-[148px] animate-pulse rounded-xl bg-muted/50" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-[156px] animate-pulse rounded-xl bg-muted/50" />
        <div className="h-[156px] animate-pulse rounded-xl bg-muted/50" />
      </div>
    </PageShell>
  );
}
