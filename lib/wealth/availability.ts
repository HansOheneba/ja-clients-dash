export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export type AvailabilitySlot = {
  start: string;
  end: string;
};

export type WeeklyAvailability = Record<Weekday, AvailabilitySlot[]>;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  sunday: "S",
  monday: "M",
  tuesday: "T",
  wednesday: "W",
  thursday: "T",
  friday: "F",
  saturday: "S",
};

/** Sunday-first order, matching common scheduling UIs. */
export const WEEKDAYS_SUNDAY_FIRST: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const AVAILABILITY_STORAGE_VERSION = 1;

export type StoredAvailability = {
  version: typeof AVAILABILITY_STORAGE_VERSION;
  schedule: WeeklyAvailability;
};

export function emptyWeeklyAvailability(): WeeklyAvailability {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };
}

export function defaultWeeklyAvailability(): WeeklyAvailability {
  const weekdays: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const schedule = emptyWeeklyAvailability();
  for (const day of weekdays) {
    schedule[day] = [{ start: "09:00", end: "17:00" }];
  }
  return schedule;
}

export function buildTimeOptions(stepMinutes = 30): string[] {
  const options: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    options.push(`${hours}:${mins}`);
  }
  return options;
}

export const TIME_OPTIONS = buildTimeOptions();

export function formatTimeLabel(value: string) {
  const [hourPart, minutePart] = value.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

/** Compact label for scheduling pickers, e.g. 9:00am */
export function formatTimeLabelCompact(value: string) {
  return formatTimeLabel(value).toLowerCase().replace(" ", "");
}

export function formatSlot(slot: AvailabilitySlot) {
  return `${formatTimeLabel(slot.start)} - ${formatTimeLabel(slot.end)}`;
}

export function formatWeeklyAvailability(schedule: WeeklyAvailability) {
  return WEEKDAYS.map((day) => {
    const slots = schedule[day];
    if (slots.length === 0) {
      return `${WEEKDAY_LABELS[day]}: Unavailable`;
    }
    const ranges = slots.map((slot) => formatSlot(slot)).join(", ");
    return `${WEEKDAY_LABELS[day]}: ${ranges}`;
  }).join("\n");
}

export function serializeAvailability(schedule: WeeklyAvailability) {
  const payload: StoredAvailability = {
    version: AVAILABILITY_STORAGE_VERSION,
    schedule,
  };
  return JSON.stringify(payload);
}

export function parseAvailabilityNotes(value: string | null | undefined): WeeklyAvailability | null {
  if (!value?.trim()) return null;

  try {
    const parsed = JSON.parse(value) as StoredAvailability;
    if (parsed?.version !== AVAILABILITY_STORAGE_VERSION || !parsed.schedule) return null;
    const schedule = emptyWeeklyAvailability();
    for (const day of WEEKDAYS) {
      const slots = parsed.schedule[day];
      schedule[day] = Array.isArray(slots)
        ? slots.filter((slot) => slot?.start && slot?.end)
        : [];
    }
    return schedule;
  } catch {
    return null;
  }
}

export function formatAvailabilityNotes(value: string | null | undefined) {
  const schedule = parseAvailabilityNotes(value);
  if (schedule) return formatWeeklyAvailability(schedule);
  return value?.trim() ?? "";
}

export function hasAvailability(schedule: WeeklyAvailability) {
  return WEEKDAYS.some((day) => schedule[day].length > 0);
}

export function isValidSlot(slot: AvailabilitySlot) {
  return slot.start < slot.end;
}

export function isValidSchedule(schedule: WeeklyAvailability) {
  if (!hasAvailability(schedule)) return false;
  return WEEKDAYS.every((day) =>
    schedule[day].every((slot) => isValidSlot(slot)),
  );
}
