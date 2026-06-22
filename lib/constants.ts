import type { CalculationMethod, UserAppState } from "@/lib/types";

export const APP_NAME = "Deen Companion";

export const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 2, name: "Islamic Society of North America" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Umm al-Qura, Makkah" },
  { id: 5, name: "Egyptian General Authority" },
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 13, name: "Diyanet, Turkey" }
];

export const DEFAULT_USER_STATE: UserAppState = {
  updatedAt: new Date(0).toISOString(),
  ayahBookmarks: [],
  ayahFavorites: [],
  ayahNotes: {},
  memorizedAyahs: [],
  completedDeeds: {},
  duaFavorites: [],
  hadithBookmarks: [],
  tasbihCounts: {},
  fastingDays: [],
  goals: [
    { id: "quran", title: "Quran", category: "quran", target: 10, current: 0 },
    { id: "salah", title: "Salah on time", category: "salah", target: 5, current: 0 },
    { id: "dhikr", title: "Dhikr", category: "dhikr", target: 100, current: 0 },
    { id: "knowledge", title: "Knowledge", category: "knowledge", target: 1, current: 0 }
  ],
  preferences: {
    language: "en",
    translation: "en.sahih",
    calculationMethod: 2,
    school: 0,
    notifications: false,
    city: "New York",
    country: "United States",
    theme: "light",
    dailyQuranMinutes: 10
  }
};

export const SOURCE_DISCLAIMER =
  "For personal learning. Ask a qualified scholar for specific rulings.";
