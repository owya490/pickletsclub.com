import { addDays, formatLongDate, keyToUtcDate } from "@/lib/format";
import { ChevronIcon } from "./icons";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const monthFmt = new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", month: "long" });
const yearFmt = new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", year: "numeric" });

type Props = {
  month: string;
  todayKey: string;
  selectedDay: string | null;
  eventDays: Set<string>;
  onSelectDay: (key: string | null) => void;
  onMonthChange: (month: string) => void;
};

function shiftMonth(month: string, delta: number): string {
  const date = keyToUtcDate(month);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 10);
}

export function Calendar({ month, todayKey, selectedDay, eventDays, onSelectDay, onMonthChange }: Props) {
  const gridStart = addDays(month, -keyToUtcDate(month).getUTCDay());
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const monthPrefix = month.slice(0, 7);
  const isCurrentMonth = monthPrefix === todayKey.slice(0, 7);
  const cursor = keyToUtcDate(month);

  return (
    <div className="rounded-2xl border border-line bg-paper p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">
          {monthFmt.format(cursor)}
          <span className="ml-1.5 font-normal text-muted">{yearFmt.format(cursor)}</span>
        </h2>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
            disabled={isCurrentMonth}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous month"
          >
            <ChevronIcon direction="left" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink"
            aria-label="Next month"
          >
            <ChevronIcon direction="right" className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="pb-2 text-[11px] font-medium tracking-wide text-faint">
            {d}
          </div>
        ))}
        {days.map((key) => {
          const inMonth = key.startsWith(monthPrefix);
          const hasEvents = eventDays.has(key);
          const isSelected = key === selectedDay;
          const isToday = key === todayKey;
          const isPast = key < todayKey;
          return (
            <button
              key={key}
              type="button"
              disabled={!hasEvents}
              onClick={() => onSelectDay(isSelected ? null : key)}
              aria-pressed={isSelected}
              aria-label={formatLongDate(key)}
              className={[
                "relative mx-auto flex size-9 flex-col items-center justify-center rounded-full text-[13px] tabular-nums transition-colors",
                isSelected
                  ? "bg-forest font-medium text-paper"
                  : hasEvents
                    ? "font-medium text-ink hover:bg-canvas"
                    : "cursor-default",
                !isSelected && !hasEvents && (inMonth && !isPast ? "text-muted" : "text-faint/50"),
                isToday && !isSelected && "ring-1 ring-forest/40",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {Number(key.slice(8))}
              {hasEvents && (
                <span
                  className={`absolute bottom-1 size-1 rounded-full ${isSelected ? "bg-paper" : "bg-forest"}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
