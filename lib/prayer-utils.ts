import { PRAYER_NAMES } from "@/lib/constants";
import type { PrayerName, PrayerTimings } from "@/lib/types";

export function prayerTimeToDate(time: string, base = new Date()) {
  const [hourPart, minutePart] = time.split(":");
  const date = new Date(base);
  date.setHours(Number(hourPart), Number(minutePart), 0, 0);
  return date;
}

export function getNextPrayer(timings?: PrayerTimings | null, base = new Date()) {
  if (!timings) return null;

  const todayPrayers = PRAYER_NAMES.map((name) => ({
    name,
    time: timings[name],
    date: prayerTimeToDate(timings[name], base)
  }));

  const next = todayPrayers.find((item) => item.date.getTime() > base.getTime());
  if (next) return next;

  const tomorrow = prayerTimeToDate(timings.Fajr, base);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { name: "Fajr" as PrayerName, time: timings.Fajr, date: tomorrow };
}

export function formatPrayerClock(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(2024, 1, 1, hour, minute));
}
