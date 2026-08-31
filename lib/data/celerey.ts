export const CELEREY_ICON_SRC = "/logos/CelereySymbolLight.png";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type PromptChip = {
  id: string;
  label: string;
  query: string;
  category: "legacy" | "portfolio" | "goals" | "general";
};

export const CELEREY_WELCOME =
  "I am Celerey, your private wealth assistant. I can help you understand your portfolio, legacy readiness, goals, and estate planning gaps. Ask anything below, or choose a suggested question.";

export const clientPromptChips: PromptChip[] = [
  {
    id: "legacy-1",
    label: "What happens if I die today?",
    query: "What happens if I die today?",
    category: "legacy",
  },
  {
    id: "legacy-2",
    label: "Assets without beneficiaries",
    query: "What assets have no beneficiaries assigned?",
    category: "legacy",
  },
  {
    id: "legacy-3",
    label: "Missing estate documents",
    query: "Which estate documents are missing or out of date?",
    category: "legacy",
  },
  {
    id: "legacy-4",
    label: "Estate plan risks",
    query: "What risks exist in my current estate plan?",
    category: "legacy",
  },
  {
    id: "legacy-5",
    label: "Improve readiness score",
    query: "How can I improve my legacy readiness score?",
    category: "legacy",
  },
  {
    id: "portfolio-1",
    label: "Portfolio summary",
    query: "Give me a summary of my portfolio allocation and performance.",
    category: "portfolio",
  },
  {
    id: "goals-1",
    label: "Goals at risk",
    query: "Which of my financial goals are at risk?",
    category: "goals",
  },
  {
    id: "general-1",
    label: "Next session prep",
    query: "What should I prepare for my next advisor session?",
    category: "general",
  },
];

export const advisorPromptChips: PromptChip[] = [
  {
    id: "adv-1",
    label: "Clients needing review",
    query: "Which clients are overdue for an estate or annual review?",
    category: "general",
  },
  {
    id: "adv-2",
    label: "Legacy gaps across book",
    query: "Summarise legacy planning gaps across my client book.",
    category: "legacy",
  },
  {
    id: "adv-3",
    label: "At-risk goals",
    query: "Which clients have goals marked at risk?",
    category: "goals",
  },
  {
    id: "adv-4",
    label: "Rebalancing opportunities",
    query: "Where do I have rebalancing opportunities this quarter?",
    category: "portfolio",
  },
];

export const advisorClientPromptChips: PromptChip[] = [
  {
    id: "adv-client-1",
    label: "Portfolio summary",
    query: "Summarise this client's portfolio allocation, performance, and recent activity.",
    category: "portfolio",
  },
  {
    id: "adv-client-2",
    label: "Planning gaps",
    query: "What estate, goals, or documentation gaps should I raise with this client?",
    category: "legacy",
  },
  {
    id: "adv-client-3",
    label: "Session prep",
    query: "What should I prepare for the next session with this client?",
    category: "general",
  },
  {
    id: "adv-client-4",
    label: "Review flags",
    query: "Flag anything in this client's file that needs a review based on status, goals, or performance.",
    category: "goals",
  },
];

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
  };
}

export { createMessage };
