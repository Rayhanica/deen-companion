import { searchSourceIndex } from "@/lib/source-search";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SourceSearchResult } from "@/lib/types";

type SearchRow = {
  id: string;
  entity_type: string;
  entity_key: string;
  title: string;
  summary: string;
  url: string;
  review_status: string;
  rank: number;
  metadata: Record<string, unknown>;
};

function mapType(value: string): SourceSearchResult["type"] {
  const allowed: SourceSearchResult["type"][] = [
    "quran",
    "tafsir",
    "hadith",
    "lesson",
    "course",
    "article",
    "fatwa",
    "history",
    "dua",
    "glossary",
    "note",
    "bookmark",
    "directory",
    "community"
  ];
  return allowed.includes(value as SourceSearchResult["type"]) ? (value as SourceSearchResult["type"]) : "article";
}

export async function searchDatabaseKnowledge(query: string, scope = "all") {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [] as SourceSearchResult[];
  const entityTypes = scope === "all" ? null : [scope];
  const { data, error } = await supabase.rpc("search_knowledge", {
    search_query: query,
    search_locale: "en",
    result_limit: 30,
    entity_types: entityTypes
  });
  if (error || !data) return [] as SourceSearchResult[];
  return (data as SearchRow[]).map((row) => ({
    id: `db-${row.id}`,
    type: mapType(row.entity_type),
    title: row.title,
    excerpt: row.summary,
    reference: `${row.review_status} · relevance ${Number(row.rank).toFixed(2)}`,
    url: row.url,
    provider: String(row.metadata?.provider ?? "Deen Companion verified database")
  }));
}

export async function retrieveKnowledge(query: string, scope = "all") {
  const [database, fallback] = await Promise.all([
    searchDatabaseKnowledge(query, scope),
    searchSourceIndex(query, scope === "all" ? "all" : scope)
  ]);
  const seen = new Set<string>();
  return [...database, ...fallback].filter((result) => {
    const key = `${result.type}:${result.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
