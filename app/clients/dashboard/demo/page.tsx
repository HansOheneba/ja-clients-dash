import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { H1, Muted, TextSmall } from "@/components/ui/typography";

const DEMO_PAGES = [
  { href: "/clients/dashboard/demo/reports", label: "Reports" },
  { href: "/clients/dashboard/demo/goals", label: "My Goals" },
  { href: "/clients/dashboard/demo/wealth-plan", label: "Wealth Plan" },
  { href: "/clients/dashboard/demo/legacy", label: "Legacy" },
  { href: "/clients/dashboard/demo/celerey", label: "Ask Celerey" },
  { href: "/clients/dashboard/demo/advisor-insights", label: "Advisor Insights" },
  { href: "/clients/dashboard/demo/sessions", label: "Sessions" },
  { href: "/clients/dashboard/demo/concierge", label: "Concierge" },
  { href: "/clients/dashboard/demo/liabilities", label: "Liabilities" },
  { href: "/clients/dashboard/demo/messages", label: "Messages" },
  { href: "/clients/dashboard/demo/tasks", label: "Tasks" },
  { href: "/clients/dashboard/demo/market-insights", label: "Market Insights" },
];

export default function ClientDemoIndexPage() {
  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Demo gallery</H1>
        <Muted>
          Sample screens with filled placeholder data for design review. Production views use
          your live portfolio and reports.
        </Muted>
      </header>
      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Client demo screens</DashCardTitle>
          <DashCardDescription>Not connected to your live account data</DashCardDescription>
        </DashCardHeader>
        <DashCardContent className="gap-2">
          {DEMO_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="flex items-center justify-between border-b border-border/60 py-3 last:border-0"
            >
              <TextSmall className="font-medium">{page.label}</TextSmall>
              <TextSmall className="text-muted-foreground">Open</TextSmall>
            </Link>
          ))}
        </DashCardContent>
      </DashCard>
    </PageShell>
  );
}
