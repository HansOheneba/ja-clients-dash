import type { Goal } from "@/lib/data/goals";
import type { ClientGoal, GoalStatus } from "@/lib/wealth/types";

export const GOAL_CATEGORIES = [
  { label: "Retirement Planning", iconName: "Landmark" },
  { label: "Property Purchase", iconName: "Building2" },
  { label: "Children's Education", iconName: "GraduationCap" },
  { label: "Wealth Preservation", iconName: "HeartHandshake" },
  { label: "Family Protection", iconName: "Shield" },
  { label: "Business Expansion", iconName: "TrendingUp" },
  { label: "Second Citizenship", iconName: "Globe" },
  { label: "Philanthropic Giving", iconName: "Gift" },
  { label: "Other", iconName: "Flag" },
] as const;

export const GOAL_STATUSES: { value: GoalStatus; label: string }[] = [
  { value: "on-track", label: "On track" },
  { value: "ahead", label: "Ahead" },
  { value: "at-risk", label: "At risk" },
  { value: "in-progress", label: "In progress" },
];

export type GoalWriteInput = {
  name: string;
  category: string;
  targetUsd: number;
  currentUsd: number;
  targetDate: string | null;
  isOngoing: boolean;
  probabilityPct: number;
  status: GoalStatus;
  advisorNote: string;
  iconName: string;
};

export function iconForCategory(category: string): string {
  const match = GOAL_CATEGORIES.find((item) => item.label === category);
  return match?.iconName ?? "Flag";
}

export function formatGoalTargetDate(
  isoDate: string | null,
  isOngoing: boolean,
): string {
  if (isOngoing || !isoDate) return "Ongoing";
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function monthFromIsoDate(isoDate: string | null): string {
  if (!isoDate) return "";
  return isoDate.slice(0, 7);
}

export function isoDateFromMonth(month: string): string | null {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  return `${month}-01`;
}

export function clientGoalToGoal(row: ClientGoal): Goal {
  return {
    id: row.id,
    iconName: row.icon_name,
    category: row.category,
    name: row.name,
    targetUSD: row.target_usd,
    currentUSD: row.current_usd,
    targetDate: formatGoalTargetDate(row.target_date, row.is_ongoing),
    probabilityPct: row.probability_pct,
    status: row.status,
    advisorNote: row.advisor_note,
  };
}

export function parseGoalWrite(
  body: Record<string, unknown>,
): { ok: true; value: GoalWriteInput } | { ok: false; error: string } {
  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const advisorNote = String(body.advisorNote ?? "").trim();
  const isOngoing = Boolean(body.isOngoing);
  const targetUsd = Number(body.targetUsd);
  const currentUsd = body.currentUsd === "" || body.currentUsd == null
    ? 0
    : Number(body.currentUsd);
  const probabilityPct = body.probabilityPct === "" || body.probabilityPct == null
    ? 0
    : Number(body.probabilityPct);
  const statusRaw = String(body.status ?? "in-progress");
  const status = GOAL_STATUSES.some((item) => item.value === statusRaw)
    ? (statusRaw as GoalStatus)
    : null;

  if (!name) return { ok: false, error: "Goal name is required" };
  if (!category) return { ok: false, error: "Category is required" };
  if (!Number.isFinite(targetUsd) || targetUsd <= 0) {
    return { ok: false, error: "Target amount must be greater than 0" };
  }
  if (!Number.isFinite(currentUsd) || currentUsd < 0) {
    return { ok: false, error: "Current amount cannot be negative" };
  }
  if (!Number.isFinite(probabilityPct) || probabilityPct < 0 || probabilityPct > 100) {
    return { ok: false, error: "Success probability must be between 0 and 100" };
  }
  if (!status) return { ok: false, error: "Choose a valid status" };

  const targetDate = isOngoing
    ? null
    : isoDateFromMonth(String(body.targetMonth ?? "")) ??
      (typeof body.targetDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.targetDate)
        ? body.targetDate
        : null);

  if (!isOngoing && !targetDate) {
    return { ok: false, error: "Choose a target month, or mark the goal as ongoing" };
  }

  return {
    ok: true,
    value: {
      name,
      category,
      targetUsd,
      currentUsd,
      targetDate,
      isOngoing,
      probabilityPct,
      status,
      advisorNote,
      iconName: iconForCategory(category),
    },
  };
}
