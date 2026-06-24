import {
  deepLearningData,
  duasData,
  fatwasData,
  hadithData,
  historyStoriesData,
  learningPathsData,
  communityData,
  sourcesData,
  studyGuidesData
} from "@/lib/content";
import { resolveReference } from "@/lib/source-links";
import type { SourceSearchResult } from "@/lib/types";

const stopWords = new Set([
  "about",
  "after",
  "before",
  "could",
  "explain",
  "from",
  "have",
  "into",
  "learn",
  "should",
  "that",
  "their",
  "there",
  "these",
  "this",
  "what",
  "when",
  "where",
  "which",
  "with",
  "would",
  "your"
]);

function compact(value: string, length = 260) {
  return value.length > length ? `${value.slice(0, length).trim()}...` : value;
}

function searchTerms(query: string) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2 && !stopWords.has(term))
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);
}

function matches(query: string, value: string) {
  const terms = searchTerms(query);
  const haystack = value.toLowerCase();
  return terms.length ? terms.some((term) => haystack.includes(term)) : haystack.includes(query.toLowerCase());
}

export function searchLocalSources(query: string): SourceSearchResult[] {
  const results: SourceSearchResult[] = [];

  for (const item of learningPathsData) {
    const body = `${item.title} ${item.audience} ${item.description} ${item.outcomes.join(" ")} ${item.modules
      .flatMap((module) => [module.title, ...module.lessons])
      .join(" ")}`;
    if (!matches(query, body)) continue;
    results.push({
      id: `course-${item.id}`,
      type: "course",
      title: item.title,
      excerpt: compact(item.description),
      reference: `${item.durationWeeks} weeks · ${item.lessonCount} lessons`,
      url: `/learn/paths?path=${item.id}#${item.id}`,
      provider: "Deen Companion learning path"
    });
  }

  for (const item of studyGuidesData) {
    const body = `${item.title} ${item.topic} ${item.overview} ${item.sections
      .flatMap((section) => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])])
      .join(" ")} ${item.references.join(" ")}`;
    if (!matches(query, body)) continue;
    results.push({
      id: `lesson-${item.id}`,
      type: "lesson",
      title: item.title,
      excerpt: compact(item.overview),
      reference: item.references[0] ?? "Deen Companion study guide",
      url: `/learn?mode=knowledge&resource=${item.id}#${item.id}`,
      provider: "Deen Companion reviewed content"
    });
  }

  for (const item of deepLearningData) {
    const body = `${item.title} ${item.track} ${item.summary} ${item.reading.join(" ")} ${item.references.join(" ")}`;
    if (!matches(query, body)) continue;
    results.push({
      id: `curriculum-${item.id}`,
      type: "lesson",
      title: item.title,
      excerpt: compact(item.summary),
      reference: item.references[0] ?? item.track,
      url: `/learn?mode=lessons&resource=${item.id}#${item.id}`,
      provider: "Deen Companion curriculum"
    });
  }

  for (const item of fatwasData) {
    if (!matches(query, `${item.question} ${item.topic} ${item.answer} ${item.references.join(" ")}`)) continue;
    results.push({
      id: `fatwa-${item.id}`,
      type: "fatwa",
      title: item.question,
      excerpt: compact(item.answer),
      reference: item.references[0] ?? item.topic,
      url: `/learn?mode=fatwas&resource=${item.id}#${item.id}`,
      provider: "General learning guidance"
    });
  }

  for (const item of historyStoriesData) {
    if (!matches(query, `${item.title} ${item.category} ${item.summary} ${item.lessons.join(" ")} ${item.references.join(" ")}`)) continue;
    results.push({
      id: `history-${item.id}`,
      type: "history",
      title: item.title,
      excerpt: compact(item.summary),
      reference: item.references[0] ?? item.period,
      url: `/learn?mode=stories&resource=${item.id}#${item.id}`,
      provider: "Deen Companion history guide"
    });
  }

  for (const item of hadithData) {
    if (!matches(query, `${item.title} ${item.category} ${item.text} ${item.reference}`)) continue;
    results.push({
      id: `hadith-${item.id}`,
      type: "hadith",
      title: item.title,
      excerpt: compact(item.text),
      reference: item.reference,
      url: resolveReference(item.reference).url,
      provider: "Sunnah.com"
    });
  }

  for (const item of duasData) {
    if (!matches(query, `${item.title} ${item.category} ${item.translation} ${item.reference}`)) continue;
    results.push({
      id: `dua-${item.id}`,
      type: "dua",
      title: item.title,
      excerpt: compact(item.translation),
      reference: item.reference,
      url: resolveReference(item.reference).url,
      provider: "Referenced dua collection"
    });
  }

  for (const item of sourcesData) {
    if (!matches(query, `${item.name} ${item.usage} ${item.category ?? ""}`)) continue;
    results.push({
      id: `directory-${item.id}`,
      type: "directory",
      title: item.name,
      excerpt: item.usage,
      reference: item.authority ?? "Reference",
      url: item.url,
      provider: item.name
    });
  }

  for (const item of communityData) {
    if (!matches(query, `${item.title} ${item.organization} ${item.location} ${item.description} ${item.tags.join(" ")}`)) continue;
    results.push({
      id: `community-${item.id}`,
      type: "community",
      title: item.title,
      excerpt: compact(item.description),
      reference: `${item.organization} · ${item.schedule}`,
      url: item.href ?? `/community?type=${item.type}#${item.id}`,
      provider: item.verified ? "Verified community listing" : "Community-submitted listing"
    });
  }

  return results.slice(0, 30);
}

type QuranSearchPayload = {
  data?: {
    matches?: Array<{
      number: number;
      text: string;
      numberInSurah: number;
      surah: { number: number; englishName: string };
      edition?: { englishName?: string };
    }>;
  };
};

export async function searchQuranSources(query: string, limit = 24): Promise<SourceSearchResult[]> {
  const terms = searchTerms(query);
  const candidates = [query.trim(), ...terms].filter((value, index, all) => value.length > 1 && all.indexOf(value) === index);

  for (const candidate of candidates.slice(0, 3)) {
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(candidate)}/all/en.sahih`,
        { next: { revalidate: 60 * 60 * 12 } }
      );
      if (!response.ok) continue;
      const payload = (await response.json()) as QuranSearchPayload;
      const matches = payload.data?.matches ?? [];
      if (!matches.length) continue;
      return matches.slice(0, limit).map((ayah) => {
        const key = `${ayah.surah.number}:${ayah.numberInSurah}`;
        return {
          id: `quran-${key}`,
          type: "quran",
          title: `${ayah.surah.englishName} ${key}`,
          excerpt: ayah.text,
          reference: `Quran ${key}`,
          url: `https://quran.com/${ayah.surah.number}?startingVerse=${ayah.numberInSurah}`,
          provider: ayah.edition?.englishName ?? "Saheeh International"
        };
      });
    } catch {
      continue;
    }
  }

  return [];
}

export async function searchSourceIndex(query: string, type = "all") {
  const [quran, local] = await Promise.all([
    type === "all" || type === "quran" ? searchQuranSources(query) : Promise.resolve([]),
    type === "quran" ? Promise.resolve([]) : Promise.resolve(searchLocalSources(query))
  ]);

  return [...quran, ...local].slice(0, 50);
}
