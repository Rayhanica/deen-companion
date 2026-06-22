import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function toTitleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function percentage(current: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

export function formatMinutes(seconds: number) {
  if (seconds <= 0) return "Now";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function parseCityCountry(input: string) {
  const [city, ...rest] = input.split(",").map((part) => part.trim()).filter(Boolean);
  return {
    city: city || "New York",
    country: rest.join(", ") || "United States"
  };
}
