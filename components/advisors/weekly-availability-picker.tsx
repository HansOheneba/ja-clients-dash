"use client";

import { Plus, X } from "lucide-react";

import { Select } from "@/components/ui/select";
import { TextSmall } from "@/components/ui/typography";
import {
  GMT_OFFSET_OPTIONS,
  type GmtOffset,
} from "@/lib/wealth/timezones";
import {
  TIME_OPTIONS,
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
  WEEKDAYS_SUNDAY_FIRST,
  formatTimeLabelCompact,
  type AvailabilitySlot,
  type Weekday,
  type WeeklyAvailability,
} from "@/lib/wealth/availability";
import { cn } from "@/lib/utils";

function DayBadge({ day, active }: { day: Weekday; active: boolean }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-muted/40 text-muted-foreground",
      )}
      aria-hidden
    >
      {WEEKDAY_SHORT[day]}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

function TimeSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 min-w-0 max-w-[5.5rem] flex-1 rounded-lg border-0 bg-muted/60 px-1.5 text-sm shadow-none focus-visible:ring-2 sm:max-w-none sm:px-2"
      aria-label={label}
    >
      {TIME_OPTIONS.map((time) => (
        <option key={`${label}-${time}`} value={time}>
          {formatTimeLabelCompact(time)}
        </option>
      ))}
    </Select>
  );
}

export function WeeklyAvailabilityPicker({
  value,
  onChange,
  timezone,
  onTimezoneChange,
}: {
  value: WeeklyAvailability;
  onChange: (next: WeeklyAvailability) => void;
  timezone: string;
  onTimezoneChange: (value: string) => void;
}) {
  function updateDay(day: Weekday, slots: AvailabilitySlot[]) {
    onChange({ ...value, [day]: slots });
  }

  function enableDay(day: Weekday) {
    updateDay(day, [{ start: "09:00", end: "17:00" }]);
  }

  function clearDay(day: Weekday) {
    updateDay(day, []);
  }

  function updateSlot(day: Weekday, index: number, patch: Partial<AvailabilitySlot>) {
    const slots = value[day].map((slot, slotIndex) =>
      slotIndex === index ? { ...slot, ...patch } : slot,
    );
    updateDay(day, slots);
  }

  function addSlot(day: Weekday) {
    const last = value[day].at(-1);
    const start = last?.end ?? "09:00";
    const startIndex = TIME_OPTIONS.indexOf(start);
    const end = TIME_OPTIONS[Math.min(startIndex + 2, TIME_OPTIONS.length - 1)] ?? "17:00";
    updateDay(day, [...value[day], { start, end }]);
  }

  function removeSlot(day: Weekday, index: number) {
    const slots = value[day].filter((_, slotIndex) => slotIndex !== index);
    updateDay(day, slots);
  }

  return (
    <div className="rounded-xl border border-border/70 bg-background">
      <div className="border-b border-border/60 px-4 py-3.5 sm:px-5">
        <TextSmall className="font-medium">Weekly hours</TextSmall>
        <TextSmall className="text-muted-foreground">
          Set when you are typically available for client sessions.
        </TextSmall>
      </div>

      <div className="divide-y divide-border/60">
        {WEEKDAYS_SUNDAY_FIRST.map((day) => {
          const slots = value[day];
          const enabled = slots.length > 0;

          return (
            <div key={day} className="px-4 py-3 sm:px-5">
              {!enabled ? (
                <div className="flex items-center gap-3">
                  <DayBadge day={day} active={false} />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <TextSmall className="text-muted-foreground">Unavailable</TextSmall>
                    <IconButton label={`Add hours for ${WEEKDAY_LABELS[day]}`} onClick={() => enableDay(day)}>
                      <Plus className="size-4" />
                    </IconButton>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {slots.map((slot, index) => (
                    <div key={`${day}-${index}`} className="flex items-center gap-3">
                      {index === 0 ? (
                        <DayBadge day={day} active />
                      ) : (
                        <div className="size-8 shrink-0" aria-hidden />
                      )}

                      <div className="flex min-w-0 flex-1 items-center gap-1">
                        <TimeSelect
                          value={slot.start}
                          onChange={(next) => updateSlot(day, index, { start: next })}
                          label={`${WEEKDAY_LABELS[day]} start time`}
                        />
                        <span className="shrink-0 text-xs text-muted-foreground">-</span>
                        <TimeSelect
                          value={slot.end}
                          onChange={(next) => updateSlot(day, index, { end: next })}
                          label={`${WEEKDAY_LABELS[day]} end time`}
                        />
                      </div>

                      <div className="flex shrink-0 items-center">
                        <IconButton
                          label={
                            slots.length === 1
                              ? `Clear ${WEEKDAY_LABELS[day]}`
                              : `Remove ${WEEKDAY_LABELS[day]} interval`
                          }
                          onClick={() =>
                            slots.length === 1 ? clearDay(day) : removeSlot(day, index)
                          }
                        >
                          <X className="size-4" />
                        </IconButton>
                        {index === slots.length - 1 ? (
                          <IconButton
                            label={`Add interval for ${WEEKDAY_LABELS[day]}`}
                            onClick={() => addSlot(day)}
                          >
                            <Plus className="size-4" />
                          </IconButton>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-border/60 px-4 py-3.5 sm:px-5">
        <label htmlFor="availability-timezone" className="sr-only">
          Timezone
        </label>
        <Select
          id="availability-timezone"
          value={timezone}
          onChange={(event) => onTimezoneChange(event.target.value)}
          className="h-9 border-0 bg-transparent px-0 text-sm font-medium text-primary shadow-none focus-visible:ring-0"
        >
          {GMT_OFFSET_OPTIONS.map((tz: GmtOffset) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
