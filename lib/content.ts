import duas from "@/content/duas.json";
import deepLearning from "@/content/deep-learning.json";
import fatwas from "@/content/fatwas.json";
import goals from "@/content/goals.json";
import hadith from "@/content/hadith.json";
import historyStories from "@/content/history-stories.json";
import calendar from "@/content/islamic-calendar.json";
import community from "@/content/community.json";
import knowledge from "@/content/knowledge.json";
import learningPaths from "@/content/learning-paths.json";
import quranCurriculum from "@/content/quran-curriculum.json";
import sources from "@/content/sources.json";
import studyGuides from "@/content/study-guides.json";
import tajweed from "@/content/tajweed.json";
import type {
  ContentSource,
  CommunityItem,
  DailyGoal,
  DeepLearningLesson,
  Dua,
  FatwaItem,
  Hadith,
  HistoryStory,
  IslamicDateItem,
  KnowledgeArticle,
  LearningPath,
  StudyGuide,
  TajweedLesson
} from "@/lib/types";

export const duasData = duas as Dua[];
export const hadithData = hadith as Hadith[];
export const knowledgeData = knowledge as KnowledgeArticle[];
export const studyGuidesData = studyGuides as StudyGuide[];
export const deepLearningData = [...(quranCurriculum as DeepLearningLesson[]), ...(deepLearning as DeepLearningLesson[])];
export const fatwasData = fatwas as FatwaItem[];
export const historyStoriesData = historyStories as HistoryStory[];
export const tajweedData = tajweed as TajweedLesson[];
export const goalsData = goals as DailyGoal[];
export const islamicCalendarData = calendar as IslamicDateItem[];
export const sourcesData = sources as ContentSource[];
export const learningPathsData = learningPaths as LearningPath[];
export const communityData = community as CommunityItem[];

export function getDailyItem<T>(items: T[], date = new Date()): T {
  const key = Math.floor(date.getTime() / 86_400_000);
  return items[key % items.length];
}

export function searchText<T extends Record<string, unknown>>(items: T[], query: string, keys: Array<keyof T>) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) =>
    keys.some((key) => String(item[key] ?? "").toLowerCase().includes(normalized))
  );
}
