import type { PrayerName, PrayerTimings } from "@/lib/types";

const API_BASE = "https://api.aladhan.com/v1";
const PRAYER_KEYS: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

type AlAdhanDay = {
  timings?: Record<string, string>;
  date?: {
    readable?: string;
    hijri?: {
      day: string;
      month: {
        en: string;
      };
      year: string;
    };
  };
  meta?: {
    method?: {
      name?: string;
    };
  };
};

type AlAdhanPayload<T> = {
  code: number;
  status?: string;
  data: T;
};

function cleanTime(value: string) {
  return value.replace(/\s?\(.+\)/, "");
}

function normalizeTimings(data: AlAdhanDay): PrayerTimings {
  const timings = data.timings ?? {};
  const result = Object.fromEntries(PRAYER_KEYS.map((key) => [key, cleanTime(timings[key])])) as PrayerTimings;
  result.Sunrise = timings.Sunrise ? cleanTime(timings.Sunrise) : undefined;
  result.dateReadable = data.date?.readable;
  result.hijriDate = data.date?.hijri
    ? `${data.date.hijri.day} ${data.date.hijri.month.en} ${data.date.hijri.year}`
    : undefined;
  result.source = data.meta?.method?.name;
  return result;
}

async function fetchAlAdhan(path: string, params: URLSearchParams) {
  const response = await fetch(`${API_BASE}${path}?${params.toString()}`, {
    next: { revalidate: 60 * 10 }
  });
  if (!response.ok) throw new Error(`AlAdhan request failed with ${response.status}`);
  const payload = (await response.json()) as AlAdhanPayload<AlAdhanDay | AlAdhanDay[]>;
  if (payload.code !== 200) throw new Error(payload.status ?? "Prayer API request failed");
  return payload.data;
}

export async function getPrayerTimings(params: {
  city?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  method: string;
  school: string;
}) {
  const query = new URLSearchParams({
    method: params.method,
    school: params.school
  });

  if (params.latitude && params.longitude) {
    query.set("latitude", params.latitude);
    query.set("longitude", params.longitude);
    const data = await fetchAlAdhan("/timings", query);
    return normalizeTimings(Array.isArray(data) ? data[0] : data);
  }

  query.set("city", params.city || "New York");
  query.set("country", params.country || "United States");
  const data = await fetchAlAdhan("/timingsByCity", query);
  return normalizeTimings(Array.isArray(data) ? data[0] : data);
}

export async function getPrayerCalendar(params: {
  city: string;
  country: string;
  method: string;
  school: string;
  month: string;
  year: string;
}) {
  const query = new URLSearchParams(params);
  const data = await fetchAlAdhan("/calendarByCity", query);
  return (Array.isArray(data) ? data : [data]).map((day) => normalizeTimings(day));
}

export async function getQibla(latitude: string, longitude: string) {
  const response = await fetch(`${API_BASE}/qibla/${latitude}/${longitude}`, {
    next: { revalidate: 60 * 60 * 24 }
  });
  if (!response.ok) throw new Error("Unable to load qibla direction");
  const payload = await response.json();
  if (payload.code !== 200) throw new Error(payload.status ?? "Qibla request failed");
  return { direction: Math.round(payload.data.direction as number) };
}
