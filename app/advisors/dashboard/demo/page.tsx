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
  { href: "/advisors/dashboard/demo/reports", label: "Generate client report" },
  { href: "/advisors/dashboard/demo/portfolio", label: "Book portfolio rollup" },
  { href: "/advisors/dashboard/demo/sessions", label: "Sessions" },
  { href: "/advisors/dashboard/demo/tasks", label: "Tasks" },
  { href: "/advisors/dashboard/demo/messages", label: "Messages" },
  { href: "/advisors/dashboard/demo/insights", label: "Market insights" },
  { href: "/advisors/dashboard/demo/celerey", label: "Ask Celerey" },
];

export default function AdvisorDemoIndexPage() {
  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Demo gallery</H1>
        <Muted>
          Sample wealth manager screens with filled placeholder data. Use Generate client
          report to enter statement values and download a sample PDF.
        </Muted>
      </header>
      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Wealth manager demo screens</DashCardTitle>
          <DashCardDescription>Not connected to your live book data</DashCardDescription>
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
