export type GmtOffset = {
  value: string;
  label: string;
};

function offsetLabel(hours: number, minutes = 0): { value: string; label: string } {
  const sign = hours >= 0 && minutes >= 0 ? "+" : "-";
  const absHours = Math.abs(hours);
  const absMinutes = Math.abs(minutes);

  if (absHours === 0 && absMinutes === 0) {
    return { value: "GMT+0", label: "GMT" };
  }

  const value =
    absMinutes > 0
      ? `GMT${sign}${absHours}:${String(absMinutes).padStart(2, "0")}`
      : `GMT${sign}${absHours}`;

  return { value, label: value.replace("+0", "").replace("GMT", "GMT") };
}

const WHOLE_HOUR_OFFSETS = [
  -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
];

const HALF_HOUR_OFFSETS = [
  { hours: 3, minutes: 30 },
  { hours: 4, minutes: 30 },
  { hours: 5, minutes: 30 },
  { hours: 5, minutes: 45 },
  { hours: 6, minutes: 30 },
  { hours: 8, minutes: 45 },
  { hours: 9, minutes: 30 },
  { hours: 10, minutes: 30 },
  { hours: 12, minutes: 45 },
];

export const GMT_OFFSET_OPTIONS: GmtOffset[] = [
  ...WHOLE_HOUR_OFFSETS.map((hours) => offsetLabel(hours)),
  ...HALF_HOUR_OFFSETS.map(({ hours, minutes }) => offsetLabel(hours, minutes)),
].sort((a, b) => gmtOffsetToMinutes(a.value) - gmtOffsetToMinutes(b.value));

const LEGACY_IANA_TO_GMT: Record<string, string> = {
  "America/New_York": "GMT-5",
  "America/Chicago": "GMT-6",
  "America/Denver": "GMT-7",
  "America/Los_Angeles": "GMT-8",
  "America/Cayman": "GMT-5",
  "Europe/London": "GMT+0",
  "Europe/Paris": "GMT+1",
  "Asia/Singapore": "GMT+8",
  "Asia/Hong_Kong": "GMT+8",
};

export function gmtOffsetToMinutes(value: string) {
  const match = value.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours * 60 + minutes);
}

export function normalizeTimezoneValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return "GMT+0";
  if (trimmed.startsWith("GMT")) return trimmed;
  return LEGACY_IANA_TO_GMT[trimmed] ?? "GMT+0";
}

export function formatTimezoneLabel(value: string | null | undefined) {
  const normalized = normalizeTimezoneValue(value);
  const option = GMT_OFFSET_OPTIONS.find((item) => item.value === normalized);
  return option?.label ?? normalized;
}
