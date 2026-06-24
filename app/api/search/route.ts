import { NextResponse } from "next/server";
import { retrieveKnowledge } from "@/lib/search/retrieval";

const allowedScopes = new Set([
  "all",
  "quran",
  "hadith",
  "dua",
  "lesson",
  "course",
  "fatwa",
  "history",
  "directory",
  "community"
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const scope = (searchParams.get("scope") ?? "all").trim();

  if (query.length < 2) {
    return NextResponse.json({ results: [], error: "Enter at least two characters." }, { status: 400 });
  }

  const normalizedScope = allowedScopes.has(scope) ? scope : "all";
  const results = await retrieveKnowledge(query, normalizedScope);
  const filtered = normalizedScope === "all" ? results : results.filter((item) => item.type === normalizedScope);

  return NextResponse.json({
    query,
    scope: normalizedScope,
    results: filtered.slice(0, 40),
    counts: filtered.reduce<Record<string, number>>((counts, item) => {
      counts[item.type] = (counts[item.type] ?? 0) + 1;
      return counts;
    }, {})
  });
}
