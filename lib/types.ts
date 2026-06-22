export type SourceReference = {
  label: string;
  detail?: string;
  url?: string;
};

export type Dua = {
  id: string;
  category: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
};

export type Hadith = {
  id: string;
  collection: string;
  number: string;
  category: string;
  title: string;
  text: string;
  reference: string;
};

export type KnowledgeArticle = {
  id: string;
  topic: string;
  level: "Beginner" | "Intermediate" | "All levels";
  title: string;
  summary: string;
  steps: string[];
  references: string[];
  disclaimer: string;
};

export type DeepLearningLesson = {
  id: string;
  track: string;
  level: "Beginner" | "Intermediate" | "All levels";
  title: string;
  summary: string;
  objectives: string[];
  reading: string[];
  practice: string;
  references: string[];
};

export type FatwaItem = {
  id: string;
  topic: string;
  question: string;
  answer: string;
  references: string[];
  disclaimer: string;
};

export type HistoryStory = {
  id: string;
  category: string;
  title: string;
  period: string;
  summary: string;
  lessons: string[];
  references: string[];
};

export type TajweedLesson = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "All levels";
  summary: string;
  practice: string;
  reference: string;
};

export type DailyGoal = {
  id: string;
  title: string;
  category: "salah" | "quran" | "dhikr" | "charity" | "knowledge";
  defaultTarget: number;
};

export type IslamicDateItem = {
  id: string;
  name: string;
  hijriMonth: string;
  hijriDay: number;
  type: "fasting" | "worship" | "eid";
  note: string;
};

export type ContentSource = {
  id: string;
  name: string;
  url: string;
  usage: string;
};

export type QuranAyah = {
  number: number;
  numberInSurah: number;
  juz: number;
  page?: number;
  surahNumber: number;
  surahEnglishName: string;
  surahName: string;
  arabic: string;
  translation: string;
  transliteration: string;
  audio?: string;
};

export type QuranTafsir = {
  ayahKey: string;
  source: string;
  text: string;
  reflection: string[];
  references: string[];
};

export type QuranPassage = {
  type: "surah" | "juz";
  id: number;
  name: string;
  subtitle: string;
  ayahs: QuranAyah[];
};

export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export type PrayerTimings = Record<PrayerName, string> & {
  Sunrise?: string;
  dateReadable?: string;
  hijriDate?: string;
  source?: string;
};

export type PlaceResult = {
  id: string;
  type: "masjid" | "halal";
  name: string;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  website?: string;
  tags: Record<string, string>;
};

export type CalculationMethod = {
  id: number;
  name: string;
};

export type UserPreferences = {
  language: "en";
  translation: string;
  calculationMethod: number;
  school: 0 | 1;
  notifications: boolean;
  city: string;
  country: string;
  theme: "light" | "dark";
  dailyQuranMinutes: number;
};

export type UserGoal = {
  id: string;
  title: string;
  category: string;
  target: number;
  current: number;
};

export type UserAppState = {
  updatedAt: string;
  ayahBookmarks: string[];
  ayahFavorites: string[];
  ayahNotes: Record<string, string>;
  memorizedAyahs: string[];
  completedDeeds: Record<string, string[]>;
  duaFavorites: string[];
  hadithBookmarks: string[];
  tasbihCounts: Record<string, number>;
  fastingDays: string[];
  goals: UserGoal[];
  preferences: UserPreferences;
};
