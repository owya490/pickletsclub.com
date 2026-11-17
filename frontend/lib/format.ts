const TZ = "Australia/Sydney";

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("en-AU", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
});
const weekdayFmt = new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", weekday: "long" });
const shortDateFmt = new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", day: "numeric", month: "short" });
const longDateFmt = new Intl.DateTimeFormat("en-AU", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});
const audFmt = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

/** YYYY-MM-DD for the instant in Sydney time. */
export function sydneyDayKey(date: Date | string): string {
  return dayKeyFmt.format(new Date(date));
}

export function keyToUtcDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(key: string, days: number): string {
  const date = keyToUtcDate(key);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso)).toLowerCase();
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function dayHeading(key: string, todayKey: string): { primary: string; secondary: string } {
  const date = keyToUtcDate(key);
  const weekday = weekdayFmt.format(date);
  if (key === todayKey) return { primary: "Today", secondary: weekday };
  if (key === addDays(todayKey, 1)) return { primary: "Tomorrow", secondary: weekday };
  return { primary: shortDateFmt.format(date), secondary: weekday };
}

export function formatLongDate(key: string): string {
  return longDateFmt.format(keyToUtcDate(key));
}

export function formatPrice(cents: number): string {
  return cents === 0 ? "Free" : audFmt.format(cents / 100);
}
