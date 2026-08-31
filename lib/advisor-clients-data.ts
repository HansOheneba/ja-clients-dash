const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

type PortfolioAsset = {
  name: string;
  value: number;
  allocation: number;
  ytd: string;
  color: string;
};

type ActivityItem = {
  title: string;
  date: string;
  type: "document" | "review" | "request" | "meeting" | "note";
};

type AdvisorClient = {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  location: string;
  status: "Active" | "Review due" | "Onboarding";
  flags: string[];
  lastContact: string;
  onboardedDate: string;
  portfolio: {
    total: number;
    ytd: number;
    inceptionValue: number;
    assets: PortfolioAsset[];
    history: { month: string; value: number }[];
  };
  legacyProgress: number;
  legacyStatus: string;
  pendingRequests: number;
  openTasks: number;
  recentActivity: ActivityItem[];
  notes: string;
};

const clients: AdvisorClient[] = [
  {
    id: "john-doe",
    name: "John Doe",
    initials: "JD",
    email: "john.doe@example.com",
    phone: "+1 310 555 0100",
    location: "Beverly Hills, CA",
    status: "Active",
    flags: [],
    lastContact: "Today",
    onboardedDate: "Jan 2018",
    portfolio: {
      total: 2780521,
      ytd: 8.1,
      inceptionValue: 1600000,
      assets: [
        { name: "Income Portfolio",  value: 642000,  allocation: 23, ytd: "+8.1%",  color: "#b2936b" },
        { name: "Growth Portfolio",  value: 498000,  allocation: 18, ytd: "+13.2%", color: "#202356" },
        { name: "Venture Portfolio", value: 1605000, allocation: 58, ytd: "+9.8%",  color: "#829850" },
        { name: "Cash On Account",   value: 259521,  allocation: 9,  ytd: "N/A",    color: "#c4b5a0" },
      ],
      history: [
        2200000, 2280000, 2401521, 2480000, 2550000, 2581521,
        2595000, 2608000, 2615521, 2622000, 2638000, 2648521,
        2659000, 2672000, 2681521, 2694000, 2706000, 2714521,
        2728000, 2739000, 2747521, 2756000, 2768000, 2780521,
      ].map((v, i) => ({
        month: months[i % months.length],
        value: v,
      })),
    },
    legacyProgress: 40,
    legacyStatus: "Estate plan in review",
    pendingRequests: 0,
    openTasks: 1,
    recentActivity: [
      { title: "Q2 2026 investment report generated", date: "15 Jul 2026", type: "document" },
      { title: "Statement data updated for Q2 2026", date: "1 Jul 2026", type: "note" },
    ],
    notes: "Sample wealth client with quarterly statement data through Q2 2026. Use Statement data to edit figures or Reports to generate PDFs.",
  },
  {
    id: "lois-lane",
    name: "Lois Lane",
    initials: "LL",
    email: "lois.lane@email.com",
    phone: "+44 7700 900123",
    location: "London, UK",
    status: "Active",
    flags: ["Pending request"],
    lastContact: "3 days ago",
    onboardedDate: "Mar 2021",
    portfolio: {
      total: 3318930,
      ytd: 7.2,
      inceptionValue: 2800000,
      assets: [
        { name: "Equities",     value: 1228000, allocation: 37, ytd: "+12.4%", color: "#b2936b" },
        { name: "Fixed Income", value: 829700,  allocation: 25, ytd: "+3.8%",  color: "#202356" },
        { name: "Commodities",  value: 530000,  allocation: 16, ytd: "+18.6%", color: "#829850" },
        { name: "Real Estate",  value: 365700,  allocation: 11, ytd: "+6.2%",  color: "#484848" },
        { name: "Cash",         value: 365530,  allocation: 11, ytd: "+3.1%",  color: "#c4b5a0" },
      ],
      history: [2820000, 2890000, 2950000, 3010000, 2980000, 3050000, 3100000, 3160000, 3200000, 3240000, 3290000, 3318930].map((v, i) => ({ month: months[i], value: v })),
    },
    legacyProgress: 60,
    legacyStatus: "Estate plan review in progress",
    pendingRequests: 2,
    openTasks: 3,
    recentActivity: [
      { title: "Succession planning review requested", date: "12 Jun 2026", type: "request" },
      { title: "Quarterly portfolio review completed", date: "3 Jun 2026", type: "review" },
      { title: "Document uploaded: Trust deed amendment", date: "25 May 2026", type: "document" },
      { title: "Advisor meeting: estate planning session", date: "10 May 2026", type: "meeting" },
      { title: "Offshore banking enquiry submitted", date: "2 May 2026", type: "request" },
    ],
    notes: "Lois is focused on long-term legacy planning and succession for her estate. Prefers email communication. Has expressed interest in increasing digital assets exposure subject to risk review.",
  },
  {
    id: "marcus-webb",
    name: "Marcus Webb",
    initials: "MW",
    email: "m.webb@webbgroup.com",
    phone: "+44 7700 900456",
    location: "Manchester, UK",
    status: "Active",
    flags: [],
    lastContact: "Yesterday",
    onboardedDate: "Jan 2019",
    portfolio: {
      total: 8140200,
      ytd: 5.4,
      inceptionValue: 6200000,
      assets: [
        { name: "Equities",     value: 3174600, allocation: 39, ytd: "+11.2%", color: "#b2936b" },
        { name: "Fixed Income", value: 2600000, allocation: 32, ytd: "+8.4%",  color: "#202356" },
        { name: "Real Estate",  value: 1546200, allocation: 19, ytd: "+6.1%",  color: "#484848" },
        { name: "Cash",         value: 819400,  allocation: 10, ytd: "+3.1%",  color: "#c4b5a0" },
      ],
      history: [6200000, 6410000, 6580000, 6720000, 6850000, 7000000, 7150000, 7380000, 7520000, 7740000, 7940000, 8140200].map((v, i) => ({ month: months[i], value: v })),
    },
    legacyProgress: 85,
    legacyStatus: "Succession plan finalised",
    pendingRequests: 0,
    openTasks: 1,
    recentActivity: [
      { title: "Q1 2026 statement uploaded", date: "10 Jun 2026", type: "document" },
      { title: "Annual review completed", date: "28 Apr 2026", type: "review" },
      { title: "Real estate acquisition briefing", date: "15 Mar 2026", type: "meeting" },
      { title: "Succession plan signed off", date: "20 Feb 2026", type: "document" },
    ],
    notes: "Marcus is one of our longest-standing clients. Very hands-on with property acquisitions. Prefers in-person meetings and monthly status calls. Looking to consolidate his fixed income position.",
  },
  {
    id: "priya-nair",
    name: "Priya Nair",
    initials: "PN",
    email: "priya.nair@nairventures.co.uk",
    phone: "+44 7700 900789",
    location: "Birmingham, UK",
    status: "Active",
    flags: [],
    lastContact: "1 week ago",
    onboardedDate: "Sep 2022",
    portfolio: {
      total: 5620000,
      ytd: 9.1,
      inceptionValue: 4400000,
      assets: [
        { name: "Equities",      value: 2080000, allocation: 37, ytd: "+15.3%", color: "#b2936b" },
        { name: "Digital Assets",value: 1462000, allocation: 26, ytd: "+42.1%", color: "#829850" },
        { name: "Fixed Income",  value: 1181000, allocation: 21, ytd: "+9.2%",  color: "#202356" },
        { name: "Commodities",   value: 897000,  allocation: 16, ytd: "-2.1%",  color: "#484848" },
      ],
      history: [4400000, 4520000, 4610000, 4750000, 4880000, 4960000, 5050000, 5180000, 5290000, 5380000, 5510000, 5620000].map((v, i) => ({ month: months[i], value: v })),
    },
    legacyProgress: 40,
    legacyStatus: "Will review complete, trust structure pending",
    pendingRequests: 1,
    openTasks: 2,
    recentActivity: [
      { title: "Estate plan: will review marked complete", date: "8 Jun 2026", type: "review" },
      { title: "Digital assets position increased", date: "20 May 2026", type: "note" },
      { title: "Trust structure review initiated", date: "5 May 2026", type: "document" },
      { title: "Mid-year portfolio review", date: "14 Apr 2026", type: "review" },
    ],
    notes: "Priya has a strong appetite for digital assets and has doubled her allocation this year. Key focus now is setting up a family trust. Prefers brief written updates over calls.",
  },
  {
    id: "daniel-osei",
    name: "Daniel Osei",
    initials: "DO",
    email: "d.osei@osei-holdings.com",
    phone: "+44 7700 900321",
    location: "Leeds, UK",
    status: "Review due",
    flags: ["Overdue review"],
    lastContact: "3 weeks ago",
    onboardedDate: "Jun 2020",
    portfolio: {
      total: 2440000,
      ytd: -1.8,
      inceptionValue: 2600000,
      assets: [
        { name: "Equities",     value: 976000,  allocation: 40, ytd: "-3.2%", color: "#b2936b" },
        { name: "Commodities",  value: 829600,  allocation: 34, ytd: "-8.1%", color: "#484848" },
        { name: "Fixed Income", value: 439200,  allocation: 18, ytd: "+6.4%", color: "#202356" },
        { name: "Cash",         value: 195200,  allocation: 8,  ytd: "+3.1%", color: "#c4b5a0" },
      ],
      history: [2600000, 2580000, 2560000, 2520000, 2490000, 2510000, 2480000, 2460000, 2450000, 2440000, 2455000, 2440000].map((v, i) => ({ month: months[i], value: v })),
    },
    legacyProgress: 20,
    legacyStatus: "No active estate plan",
    pendingRequests: 0,
    openTasks: 4,
    recentActivity: [
      { title: "Quarterly check-in missed (rescheduled to 22 Jun)", date: "1 Jun 2026", type: "meeting" },
      { title: "Portfolio performance flagged for review", date: "15 May 2026", type: "note" },
      { title: "Annual review due (overdue)", date: "30 Apr 2026", type: "review" },
      { title: "Commodities position declined 8% YTD", date: "14 Apr 2026", type: "note" },
    ],
    notes: "Daniel has been difficult to reach over the past month. His commodities and equities positions are underperforming. Urgent to schedule a review and discuss rebalancing strategy. Consider reducing high-risk exposure.",
  },
  {
    id: "amara-diallo",
    name: "Amara Diallo",
    initials: "AD",
    email: "amara@diallogroup.africa",
    phone: "+44 7700 900654",
    location: "London, UK",
    status: "Active",
    flags: [],
    lastContact: "2 days ago",
    onboardedDate: "Nov 2018",
    portfolio: {
      total: 11200000,
      ytd: 6.8,
      inceptionValue: 8500000,
      assets: [
        { name: "Equities",      value: 4368000, allocation: 39, ytd: "+9.4%",  color: "#b2936b" },
        { name: "Real Estate",   value: 3248000, allocation: 29, ytd: "+5.1%",  color: "#202356" },
        { name: "Fixed Income",  value: 2128000, allocation: 19, ytd: "+2.8%",  color: "#484848" },
        { name: "Digital Assets",value: 896000,  allocation: 8,  ytd: "+38.5%", color: "#829850" },
        { name: "Cash",          value: 560000,  allocation: 5,  ytd: "+3.1%",  color: "#c4b5a0" },
      ],
      history: [8500000, 8800000, 9050000, 9280000, 9500000, 9700000, 9950000, 10200000, 10450000, 10700000, 10960000, 11200000].map((v, i) => ({ month: months[i], value: v })),
    },
    legacyProgress: 90,
    legacyStatus: "Succession plan and trusts fully established",
    pendingRequests: 0,
    openTasks: 1,
    recentActivity: [
      { title: "Bi-monthly advisory call completed", date: "13 Jun 2026", type: "meeting" },
      { title: "Real estate new acquisition: Bristol property", date: "28 May 2026", type: "note" },
      { title: "Succession briefing with family completed", date: "10 Apr 2026", type: "meeting" },
      { title: "Annual review: all targets met", date: "15 Jan 2026", type: "review" },
    ],
    notes: "Amara is our highest-value client and has a very clear long-term strategy. Bi-monthly advisory calls are standard. She is exploring expansion into African real estate markets via a new property fund.",
  },
  {
    id: "theo-baxter",
    name: "Theo Baxter",
    initials: "TB",
    email: "theo.baxter@tbaxter.co.uk",
    phone: "+44 7700 900987",
    location: "Edinburgh, UK",
    status: "Onboarding",
    flags: ["Onboarding"],
    lastContact: "Today",
    onboardedDate: "Jun 2026",
    portfolio: {
      total: 1890000,
      ytd: 0,
      inceptionValue: 1890000,
      assets: [
        { name: "Equities",     value: 907200, allocation: 48, ytd: "0%", color: "#b2936b" },
        { name: "Fixed Income", value: 604800, allocation: 32, ytd: "0%", color: "#202356" },
        { name: "Cash",         value: 378000, allocation: 20, ytd: "0%", color: "#c4b5a0" },
      ],
      history: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1890000].map((v, i) => ({ month: months[i], value: v })),
    },
    legacyProgress: 0,
    legacyStatus: "Not started",
    pendingRequests: 0,
    openTasks: 5,
    recentActivity: [
      { title: "Onboarding call completed", date: "15 Jun 2026", type: "meeting" },
      { title: "KYC documents submitted", date: "12 Jun 2026", type: "document" },
      { title: "Initial portfolio allocation agreed", date: "10 Jun 2026", type: "note" },
      { title: "Welcome pack sent", date: "8 Jun 2026", type: "document" },
    ],
    notes: "Theo is a new client referred by Marcus Webb. He is a tech entrepreneur looking to diversify into managed equities and UK real estate. Still completing onboarding documentation.",
  },
];

function getClientById(id: string): AdvisorClient | undefined {
  return clients.find((c) => c.id === id);
}

export { clients, getClientById, type AdvisorClient, type ActivityItem };
