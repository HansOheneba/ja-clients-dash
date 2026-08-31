// JA Wealth Universe data: replace with API calls

export interface JaHolding {
  name: string;
  location: string;
  valueUSD: number;
  returnPct: number;
}

export interface JaOpportunity {
  title: string;
  description: string;
  closesDate: string;
}

export interface JaBusiness {
  id: string;
  iconName: string;
  name: string;
  tagline: string;
  color: string;
  holdings: JaHolding[];
  opportunity: JaOpportunity | null;
}

export const jaBusinesses: JaBusiness[] = [
  {
    id: "realty",
    iconName: "Building",
    name: "JA Realty",
    tagline: "Premium real estate across Africa, UK, and Dubai",
    color: "#b2936b",
    holdings: [
      { name: "Canary Wharf Residential Unit", location: "London, UK",   valueUSD: 380_000, returnPct: 8.2  },
      { name: "Accra Premium Office Space",    location: "Accra, Ghana", valueUSD: 220_000, returnPct: 12.4 },
    ],
    opportunity: {
      title: "Dubai Waterfront Co-investment",
      description: "Fractional co-investment in a premium waterfront development. Projected yield: 6.8% p.a.",
      closesDate: "30 Jun 2026",
    },
  },
  {
    id: "elements",
    iconName: "Gem",
    name: "JA Elements",
    tagline: "Precious metals, minerals, and energy assets",
    color: "#829850",
    holdings: [
      { name: "Gold Bullion Allocation", location: "Allocated, London Vault", valueUSD: 405_000, returnPct: 18.2 },
      { name: "Silver ETF Exposure",     location: "iShares Physical",        valueUSD: 179_700, returnPct: 8.4  },
    ],
    opportunity: {
      title: "Accra Digital Exchange Pre-IPO",
      description: "Early-access equity stake in Ghana's first regulated digital securities exchange.",
      closesDate: "15 Jul 2026",
    },
  },
  {
    id: "digital",
    iconName: "Cpu",
    name: "JA Digital",
    tagline: "Technology investments and digital ventures",
    color: "#202356",
    holdings: [],
    opportunity: {
      title: "African Fintech Seed Round",
      description: "Access to a curated basket of early-stage African fintech companies. Min. $50,000.",
      closesDate: "31 Jul 2026",
    },
  },
  {
    id: "celerey",
    iconName: "Zap",
    name: "Celerey",
    tagline: "JA's AI wealth planning tool for self-service guidance",
    color: "#484848",
    holdings: [],
    opportunity: null,
  },
];
