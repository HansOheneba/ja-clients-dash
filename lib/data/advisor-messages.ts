type AdvisorMessage = {
  id: string;
  content: string;
  sentAt: string;
  isFromAdvisor: boolean;
};

type AdvisorMessageThread = {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  subject: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: AdvisorMessage[];
};

const advisorMessageThreads: AdvisorMessageThread[] = [
  {
    id: "mt1",
    clientId: "lois-lane",
    clientName: "Lois Lane",
    clientInitials: "LL",
    subject: "Succession planning review",
    lastMessage:
      "I will have the full succession brief ready for our meeting on the 16th.",
    lastMessageTime: "2 hours ago",
    unreadCount: 1,
    messages: [
      {
        id: "m1",
        content:
          "Hi Jude, I would like to formally request a succession planning review. I have been thinking about the trust structure and want to revisit the beneficiary allocations.",
        sentAt: "12 Jun 2026, 9:14 AM",
        isFromAdvisor: false,
      },
      {
        id: "m2",
        content:
          "Thanks for reaching out, Lois. That makes perfect sense given where we are in the estate planning timeline. I will pull together the current trust documents and we can work through the changes together.",
        sentAt: "12 Jun 2026, 10:02 AM",
        isFromAdvisor: true,
      },
      {
        id: "m3",
        content: "Sounds great. Should I expect anything to review before the meeting?",
        sentAt: "12 Jun 2026, 10:45 AM",
        isFromAdvisor: false,
      },
      {
        id: "m4",
        content:
          "I will have the full succession brief ready for our meeting on the 16th.",
        sentAt: "12 Jun 2026, 11:20 AM",
        isFromAdvisor: true,
      },
    ],
  },
  {
    id: "mt2",
    clientId: "marcus-webb",
    clientName: "Marcus Webb",
    clientInitials: "MW",
    subject: "Q1 statement and Bristol acquisition briefing",
    lastMessage: "The Bristol acquisition looks promising. I will review the brief this week.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m5",
        content:
          "Jude, just to confirm I have uploaded the Q1 2026 statement to the portal. Please let me know if you need anything else for the annual review.",
        sentAt: "10 Jun 2026, 8:30 AM",
        isFromAdvisor: false,
      },
      {
        id: "m6",
        content:
          "Received, thank you Marcus. I have also attached the Bristol real estate acquisition briefing for you to review ahead of our next call.",
        sentAt: "10 Jun 2026, 9:15 AM",
        isFromAdvisor: true,
      },
      {
        id: "m7",
        content: "The Bristol acquisition looks promising. I will review the brief this week.",
        sentAt: "10 Jun 2026, 4:00 PM",
        isFromAdvisor: false,
      },
    ],
  },
  {
    id: "mt3",
    clientId: "priya-nair",
    clientName: "Priya Nair",
    clientInitials: "PN",
    subject: "Trust structure and digital assets review",
    lastMessage: "Noted. I will send over the trust proposal draft by Friday.",
    lastMessageTime: "3 days ago",
    unreadCount: 0,
    messages: [
      {
        id: "m8",
        content:
          "Hi Jude, I wanted to confirm that the will review is complete. Can we now move forward with setting up the family trust?",
        sentAt: "8 Jun 2026, 10:00 AM",
        isFromAdvisor: false,
      },
      {
        id: "m9",
        content:
          "That is great news, Priya. Yes, the next step is drafting the trust deed. I will coordinate with the legal team and come back to you with a proposal.",
        sentAt: "8 Jun 2026, 11:30 AM",
        isFromAdvisor: true,
      },
      {
        id: "m10",
        content: "Noted. I will send over the trust proposal draft by Friday.",
        sentAt: "9 Jun 2026, 9:00 AM",
        isFromAdvisor: true,
      },
    ],
  },
  {
    id: "mt4",
    clientId: "amara-diallo",
    clientName: "Amara Diallo",
    clientInitials: "AD",
    subject: "African real estate expansion",
    lastMessage: "Looking forward to the briefing document, Jude.",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
    messages: [
      {
        id: "m11",
        content:
          "Jude, following our call, I am very excited about the African real estate vehicle. When can I expect the formal briefing?",
        sentAt: "13 Jun 2026, 2:00 PM",
        isFromAdvisor: false,
      },
      {
        id: "m12",
        content:
          "We are putting the briefing together now. I expect to have it to you by 20 June, with a proposed structure and projected returns.",
        sentAt: "13 Jun 2026, 3:15 PM",
        isFromAdvisor: true,
      },
      {
        id: "m13",
        content: "Looking forward to the briefing document, Jude.",
        sentAt: "13 Jun 2026, 3:45 PM",
        isFromAdvisor: false,
      },
    ],
  },
  {
    id: "mt5",
    clientId: "theo-baxter",
    clientName: "Theo Baxter",
    clientInitials: "TB",
    subject: "Onboarding and welcome",
    lastMessage: "See you on Thursday, Theo.",
    lastMessageTime: "Today",
    unreadCount: 2,
    messages: [
      {
        id: "m14",
        content:
          "Hi Jude, just received the welcome pack. Everything looks great. Looking forward to our onboarding call on Thursday.",
        sentAt: "15 Jun 2026, 10:00 AM",
        isFromAdvisor: false,
      },
      {
        id: "m15",
        content:
          "Welcome to JA Wealth, Theo. We are thrilled to have you on board. If you have any questions before Thursday, feel free to send them through.",
        sentAt: "15 Jun 2026, 10:30 AM",
        isFromAdvisor: true,
      },
      {
        id: "m16",
        content: "One quick question: should I bring anything specific to the call?",
        sentAt: "15 Jun 2026, 11:00 AM",
        isFromAdvisor: false,
      },
      {
        id: "m17",
        content: "See you on Thursday, Theo.",
        sentAt: "15 Jun 2026, 11:15 AM",
        isFromAdvisor: true,
      },
    ],
  },
];

export {
  advisorMessageThreads,
  type AdvisorMessageThread,
  type AdvisorMessage,
};
