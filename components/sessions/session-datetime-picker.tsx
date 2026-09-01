"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatTimeLabelCompact } from "@/lib/wealth/availability";
import {
  BUSINESS_TIME_SLOTS,
  addMonths,
  combineDateAndTime,
  isSameCalendarDay,
  monthLabel,
  buildMonthCells,
  splitIsoDateTime,
  startOfDay,
} from "@/lib/sessions/datetime";
import { cn } from "@/lib/utils";
import { Muted, TextSmall } from "@/components/ui/typography";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function SessionDateTimePicker({
  value,
  onChange,
  className,
}: {
  value: string | null;
  onChange: (iso: string) => void;
  className?: string;
}) {
  const parsed = splitIsoDateTime(value);
  const [monthCursor, setMonthCursor] = useState(() => startOfDay(parsed?.date ?? new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(parsed?.date ?? null);
  const [selectedTime, setSelectedTime] = useState(parsed?.time ?? "");

  const today = startOfDay(new Date());
  const leftMonth = monthCursor;
  const rightMonth = addMonths(monthCursor, 1);

  const availableTimes = useMemo(() => {
    if (!selectedDate) return BUSINESS_TIME_SLOTS;
    const now = new Date();
    if (!isSameCalendarDay(selectedDate, now)) return BUSINESS_TIME_SLOTS;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return BUSINESS_TIME_SLOTS.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      return h * 60 + m > currentMinutes;
    });
  }, [selectedDate]);

  function pickDate(date: Date) {
    setSelectedDate(date);
    if (selectedTime) {
      onChange(combineDateAndTime(date, selectedTime));
    }
  }

  function pickTime(time: string) {
    setSelectedTime(time);
    if (selectedDate) {
      onChange(combineDateAndTime(selectedDate, time));
    }
  }

  function renderMonth(month: Date) {
    const cells = buildMonthCells(month);

    return (
      <div className="min-w-0 flex-1">
        <div className="mb-3 text-center text-sm font-semibold">{monthLabel(month)}</div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
          {WEEKDAY_LABELS.map((label) => (
            <div key={`${monthLabel(month)}-${label}`} className="py-1">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, index) => {
            if (!date) {
              return <div key={`empty-${monthLabel(month)}-${index}`} className="h-9" />;
            }

            const disabled = startOfDay(date) < today;
            const selected = selectedDate ? isSameCalendarDay(date, selectedDate) : false;

            return (
              <button
                key={date.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => pickDate(date)}
                className={cn(
                  "h-9 rounded-md text-sm transition-colors",
                  disabled && "cursor-not-allowed text-muted-foreground/35",
                  !disabled && !selected && "text-foreground hover:bg-muted/60",
                  selected && "bg-primary text-primary-foreground",
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(220px,1fr)]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setMonthCursor((current) => addMonths(current, -1))}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60"
            >
              <ChevronLeft className="size-4" />
            </button>
            <Muted className="text-xs">Select a date</Muted>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setMonthCursor((current) => addMonths(current, 1))}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            {renderMonth(leftMonth)}
            {renderMonth(rightMonth)}
          </div>
        </div>

        <div className="border-t border-border pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
          <TextSmall className="mb-3 font-medium">
            {selectedDate
              ? selectedDate.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Pick a time"}
          </TextSmall>
          {!selectedDate ? (
            <Muted className="text-sm">Choose a date to see available times.</Muted>
          ) : availableTimes.length === 0 ? (
            <Muted className="text-sm">No times left today. Try another date.</Muted>
          ) : (
            <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
              {availableTimes.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => pickTime(slot)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                    selectedTime === slot
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  {formatTimeLabelCompact(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
