export type ReportKind = "monthly" | "quarterly" | "annual";

export const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type DateWindow = {
  start: string;
  end: string;
  label: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function isReportKind(value: unknown): value is ReportKind {
  return value === "monthly" || value === "quarterly" || value === "annual";
}

export function calendarMonthBounds(year: number, monthIndex0: number): DateWindow {
  const month = monthIndex0 + 1;
  const start = `${year}-${pad(month)}-01`;
  const lastDay = new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
  const end = `${year}-${pad(month)}-${pad(lastDay)}`;
  const label = new Date(year, monthIndex0, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  return { start, end, label };
}

export function formatShortDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function quarterOfMonth(monthIndex0: number): 1 | 2 | 3 | 4 {
  return (Math.floor(monthIndex0 / 3) + 1) as 1 | 2 | 3 | 4;
}

export function quarterBounds(year: number, quarter: 1 | 2 | 3 | 4): DateWindow {
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;
  const start = calendarMonthBounds(year, startMonth).start;
  const end = calendarMonthBounds(year, endMonth).end;
  return {
    start,
    end,
    label: `Q${quarter} ${year} (${formatShortDate(start)} to ${formatShortDate(end)})`,
  };
}

export function yearBounds(year: number): DateWindow {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return {
    start,
    end,
    label: `${year} (${formatShortDate(start)} to ${formatShortDate(end)})`,
  };
}

export function statementKindTitle(kind: ReportKind): string {
  if (kind === "monthly") return "Monthly statement";
  if (kind === "quarterly") return "Quarterly statement";
  return "Annual statement";
}

/** Window the PDF covers, derived from the month the advisor is working in. */
export function reportWindowForPeriod(
  period: { period_start: string; period_end: string; label: string },
  kind: ReportKind,
): DateWindow {
  const y = Number(period.period_end.slice(0, 4));
  const m = Number(period.period_end.slice(5, 7)) - 1;
  if (kind === "monthly") {
    const exact = calendarMonthBounds(y, m);
    const isCalendarMonth =
      period.period_start === exact.start && period.period_end === exact.end;
    if (isCalendarMonth) return exact;
    return {
      start: period.period_start,
      end: period.period_end,
      label: period.label,
    };
  }
  if (kind === "quarterly") {
    return quarterBounds(y, quarterOfMonth(m));
  }
  return yearBounds(y);
}

export function periodsOverlappingRange<
  T extends { period_start: string; period_end: string },
>(periods: T[], start: string, end: string): T[] {
  return periods
    .filter((p) => p.period_end >= start && p.period_start <= end)
    .sort((a, b) => a.period_end.localeCompare(b.period_end));
}

export function periodCoveringMonth<T extends { period_start: string; period_end: string }>(
  periods: T[],
  year: number,
  monthIndex0: number,
): T | null {
  const { start, end } = calendarMonthBounds(year, monthIndex0);
  const overlapping = periods.filter(
    (p) => p.period_end >= start && p.period_start <= end,
  );
  const exact = overlapping.find((p) => p.period_start === start && p.period_end === end);
  if (exact) return exact;
  overlapping.sort((a, b) => b.period_end.localeCompare(a.period_end));
  return overlapping[0] ?? null;
}

export function yearFromPeriodEnd(
  period: { period_end: string } | null,
  fallback = new Date().getFullYear(),
) {
  if (!period) return fallback;
  return Number(period.period_end.slice(0, 4)) || fallback;
}

export function formatReportReference(
  clientNumber: string,
  kind: ReportKind,
  windowEnd: string,
): string {
  const token = kind === "monthly" ? "M" : kind === "quarterly" ? "Q" : "A";
  const stamp = windowEnd.replaceAll("-", "");
  return `${clientNumber}/${token}/${stamp}`;
}

export function reportKindFromReference(reference: string): ReportKind {
  const token = reference.split("/")[1]?.[0];
  if (token === "Q") return "quarterly";
  if (token === "A") return "annual";
  return "monthly";
}
