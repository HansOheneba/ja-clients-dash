"use client";

import { ArrowUpRight, Bell, LogOut, Settings } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  DashboardGrid,
  PageSection,
  PageShell,
} from "@/components/layout/page-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardMetric,
  DashCardTitle,
} from "@/components/ui/dash-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Caption,
  Display,
  H1,
  H2,
  H3,
  H4,
  Lead,
  Muted,
  Numeric,
  Overline,
  Text,
  TextSmall,
} from "@/components/ui/typography";

const semanticColors = [
  { name: "Primary", className: "bg-primary" },
  { name: "Secondary", className: "bg-secondary" },
  { name: "Accent", className: "bg-accent" },
  { name: "Muted", className: "bg-muted" },
  { name: "Destructive", className: "bg-destructive" },
  { name: "Sidebar", className: "bg-sidebar" },
];

const brandColors = [
  { name: "Brand Primary", className: "bg-brand-primary" },
  { name: "Brand Secondary", className: "bg-brand-secondary" },
  { name: "Brand Accent", className: "bg-brand-accent" },
  { name: "Mono Dark", className: "bg-brand-mono-dark" },
  { name: "Mono Mid", className: "bg-brand-mono-mid" },
  { name: "Mono Light", className: "bg-brand-mono-light" },
];

const layoutTokens = [
  { token: "--spacing-page-x", value: "1.5rem", use: "Page horizontal padding" },
  { token: "--spacing-section", value: "2rem", use: "Section vertical gap" },
  { token: "--spacing-grid", value: "0.75rem", use: "Card grid gap" },
  { token: "--card-min-width", value: "17.5rem", use: "Card min before stack" },
  { token: "--radius-card", value: "0.75rem", use: "Card corner radius" },
];

function ColorSwatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-12 rounded-lg border border-border ${className}`} />
      <Caption>{name}</Caption>
    </div>
  );
}

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <PageSection>
      <div>
        <H2>{title}</H2>
        {description ? <Muted className="mt-1">{description}</Muted> : null}
      </div>
      {children}
    </PageSection>
  );
}

function DesignSystemPreview() {
  return (
    <DashboardShell>
      <PageShell className="flex flex-col gap-(--spacing-section)">
        <PageSection>
          <Overline>JA Wealth Design System</Overline>
          <Display>Design System Foundation</Display>
          <Lead>
            Living reference for every token and component.
          </Lead>
        </PageSection>

        <Separator />

        <SectionBlock
          title="KPI strips"
          description="Horizontal metric rows for dashboard headers and summary bars."
        >
          <KpiStrip>
            <KpiItem
              label="Total net worth"
              value="£3,318,930"
              change="+4.2% this quarter"
              trend="up"
            />
            <KpiItem
              label="Monthly income"
              value="£24,500"
              change="+1.8% vs last month"
              trend="up"
            />
            <KpiItem
              label="Pending requests"
              value="2"
              change="Action required"
              trend="neutral"
            />
            <KpiItem
              label="Portfolio risk"
              value="Moderate"
              change="-0.3% volatility"
              trend="down"
              emphasis="primary"
            />
          </KpiStrip>
        </SectionBlock>

        <SectionBlock
          title="DashCards"
          description="Primary dashboard cards: tight grid, responsive stretch, span variants."
        >
          <DashboardGrid>
            <DashCard>
              <DashCardHeader>
                <DashCardTitle>Default card</DashCardTitle>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </DashCardHeader>
              <DashCardContent>
                <DashCardMetric>£826,000</DashCardMetric>
                <DashCardDescription>28% of portfolio</DashCardDescription>
              </DashCardContent>
            </DashCard>
            <DashCard>
              <DashCardHeader>
                <DashCardTitle>With badge</DashCardTitle>
                <Badge variant="secondary">Active</Badge>
              </DashCardHeader>
              <DashCardContent>
                <DashCardMetric>42%</DashCardMetric>
                <TextSmall className="text-muted-foreground">
                  JA Wealth allocation
                </TextSmall>
              </DashCardContent>
            </DashCard>
            <DashCard span="wide">
              <DashCardHeader>
                <div>
                  <DashCardTitle>Wide card (span=&quot;wide&quot;)</DashCardTitle>
                  <DashCardDescription>Spans two grid columns</DashCardDescription>
                </div>
              </DashCardHeader>
              <DashCardContent>
                <div className="flex h-24 items-end gap-1.5">
                  {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-md bg-brand-accent/70"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </DashCardContent>
            </DashCard>
            <DashCard span="full">
              <DashCardHeader>
                <div>
                  <DashCardTitle>Full-width card (span=&quot;full&quot;)</DashCardTitle>
                  <DashCardDescription>
                    Spans the entire grid row
                  </DashCardDescription>
                </div>
              </DashCardHeader>
              <DashCardContent className="gap-3">
                {["JA Wealth", "JA Realty", "JA Digital"].map((asset) => (
                  <div
                    key={asset}
                    className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <TextSmall>{asset}</TextSmall>
                    <span className="font-numeric text-body-sm">£531,000</span>
                  </div>
                ))}
              </DashCardContent>
            </DashCard>
          </DashboardGrid>
        </SectionBlock>

        <SectionBlock
          title="shadcn Cards"
          description="Generic elevated surfaces for forms, settings, and nested content."
        >
          <DashboardGrid>
            <Card>
              <CardHeader>
                <CardTitle>Card title</CardTitle>
                <CardDescription>Card description text</CardDescription>
              </CardHeader>
              <CardContent>
                <Text>Card body content using shadcn Card.</Text>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardTitle>Small card</CardTitle>
                <CardDescription>size=&quot;sm&quot;</CardDescription>
              </CardHeader>
              <CardContent>
                <Muted>Compact variant for dense UI.</Muted>
              </CardContent>
            </Card>
          </DashboardGrid>
        </SectionBlock>

        <SectionBlock title="Typography &amp; fonts">
          <Card>
            <CardContent className="flex flex-col gap-6 pt-6">
              <div>
                <Overline>H1: Playfair Display</Overline>
                <H1>Wealth Summary</H1>
              </div>
              <div>
                <Overline>Display / H2-H4: Manrope</Overline>
                <Display className="mb-2">Portfolio Overview</Display>
                <H2 className="mb-1">Recent Activity</H2>
                <H3 className="mb-1">Asset Allocation</H3>
                <H4>Holdings by Sector</H4>
              </div>
              <div>
                <Overline>Body: Plus Jakarta Sans</Overline>
                <Text>Paragraphs, labels, and UI copy.</Text>
                <Lead>Lead paragraph for page intros.</Lead>
                <TextSmall>Small secondary text.</TextSmall>
                <Caption>Caption / timestamps</Caption>
                <Muted>Muted helper text</Muted>
              </div>
              <div>
                <Overline>Numeric: Manrope (metrics &amp; inputs)</Overline>
                <Numeric>£3,318,930.86</Numeric>
              </div>
            </CardContent>
          </Card>
        </SectionBlock>

        <SectionBlock title="Colors">
          <Card>
            <CardHeader>
              <CardTitle>Semantic tokens</CardTitle>
              <CardDescription>Used by shadcn components</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {semanticColors.map((c) => (
                <ColorSwatch key={c.name} {...c} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Brand tokens</CardTitle>
              <CardDescription>Charts, accents, escape hatch</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {brandColors.map((c) => (
                <ColorSwatch key={c.name} {...c} />
              ))}
            </CardContent>
          </Card>
        </SectionBlock>

        <SectionBlock title="Layout tokens">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Use</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {layoutTokens.map((t) => (
                    <TableRow key={t.token}>
                      <TableCell className="font-mono text-body-sm">
                        {t.token}
                      </TableCell>
                      <TableCell className="font-numeric">{t.value}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.use}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </SectionBlock>

        <SectionBlock title="Buttons">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg">Large</Button>
                <Button size="default">Default</Button>
                <Button size="sm">Small</Button>
                <Button size="icon">
                  <Bell />
                </Button>
                <Button size="icon-sm" variant="outline">
                  <Settings />
                </Button>
              </div>
              <Button disabled>Disabled</Button>
            </CardContent>
          </Card>
        </SectionBlock>

        <SectionBlock title="Badges">
          <Card>
            <CardContent className="flex flex-wrap gap-3 pt-6">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </CardContent>
          </Card>
        </SectionBlock>

        <SectionBlock title="Forms">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-text">Text input</Label>
                <Input id="ds-text" placeholder="Enter value…" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-number">Number input</Label>
                <Input id="ds-number" type="number" defaultValue="1240000" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-disabled">Disabled</Label>
                <Input id="ds-disabled" disabled placeholder="Disabled" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-invalid">Invalid</Label>
                <Input id="ds-invalid" aria-invalid placeholder="Error state" />
              </div>
            </CardContent>
          </Card>
        </SectionBlock>

        <SectionBlock title="Avatars">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 pt-6">
              <Avatar size="sm">
                <AvatarFallback>LL</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JA</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>GP</AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>
        </SectionBlock>

        <SectionBlock title="Dropdown menu">
          <Card>
            <CardContent className="pt-6">
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-lg border border-border px-3 py-2 text-body-sm">
                  Open menu
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Lois Lane</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Settings />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </SectionBlock>

        <SectionBlock title="Skeleton">
          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full rounded-(--radius-card)" />
            </CardContent>
          </Card>
        </SectionBlock>

        <SectionBlock title="Separator">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <Text>Content above</Text>
              <Separator />
              <Text>Content below</Text>
            </CardContent>
          </Card>
        </SectionBlock>

        <SectionBlock title="Table">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Allocation</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">JA Wealth</TableCell>
                    <TableCell className="font-numeric">42%</TableCell>
                    <TableCell className="text-right font-numeric">
                      £1,240,000
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Active</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">JA Realty</TableCell>
                    <TableCell className="font-numeric">28%</TableCell>
                    <TableCell className="text-right font-numeric">
                      £826,000
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Review</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">JA Digital</TableCell>
                    <TableCell className="font-numeric">18%</TableCell>
                    <TableCell className="text-right font-numeric">
                      £531,000
                    </TableCell>
                    <TableCell>
                      <Badge>Active</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </SectionBlock>
      </PageShell>
    </DashboardShell>
  );
}

export { DesignSystemPreview };
