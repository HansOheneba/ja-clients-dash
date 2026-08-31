// Market insights data: replace with API/CMS calls

export type InsightType = "commentary" | "research" | "theme" | "currency";

export interface MarketInsight {
  id: string;
  type: InsightType;
  title: string;
  date: string;
  readTimeMin: number;
  preview: string;
  tag: string;
  hasDownload: boolean;
}

export const marketInsights: MarketInsight[] = [
  {
    id: "i1",
    type: "commentary",
    title: "JA Wealth Q2 2026 Market Outlook",
    date: "16 Jun 2026",
    readTimeMin: 6,
    preview: "The Fed's pivot signal, combined with subdued inflation data, has strengthened the case for fixed income duration. We remain cautiously constructive on global equities, with a preference for quality and value over momentum.",
    tag: "House view",
    hasDownload: true,
  },
  {
    id: "i2",
    type: "research",
    title: "The New Geography of Alternatives",
    date: "3 Jun 2026",
    readTimeMin: 12,
    preview: "African private equity, Gulf real estate, and digital assets are reshaping where HNW investors find uncorrelated returns. Our thematic report on the evolving alternatives landscape.",
    tag: "Research",
    hasDownload: true,
  },
  {
    id: "i3",
    type: "theme",
    title: "Offshore Structuring in 2026: What Has Changed",
    date: "28 May 2026",
    readTimeMin: 8,
    preview: "Regulatory changes in the UK, Switzerland, and UAE are reshaping offshore structuring strategies for African HNW clients. Key implications for beneficiary designations and reporting obligations.",
    tag: "Strategy",
    hasDownload: false,
  },
  {
    id: "i4",
    type: "currency",
    title: "GHS / USD Outlook: H2 2026",
    date: "20 May 2026",
    readTimeMin: 4,
    preview: "The cedi has stabilised following IMF support measures. Our models indicate a GHS/USD range of 15.8-17.2 for H2 2026. Currency risk management remains a priority for cross-border portfolios.",
    tag: "Currency",
    hasDownload: false,
  },
  {
    id: "i5",
    type: "commentary",
    title: "Africa Economic Update: Q1 2026",
    date: "15 Apr 2026",
    readTimeMin: 7,
    preview: "Nigeria's diversification policy, Ghana's post-IMF recovery, and Kenya's tech sector growth are the three themes shaping our Africa positioning. Sub-Saharan GDP growth forecast revised upward to 4.2%.",
    tag: "Africa focus",
    hasDownload: true,
  },
];

export const TYPE_LABEL: Record<InsightType, string> = {
  commentary: "Commentary",
  research: "Research",
  theme: "Investment theme",
  currency: "Currency update",
};
