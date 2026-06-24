"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, Clock3, ExternalLink, LibraryBig, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { sourcesData } from "@/lib/content";
import type { SourceSearchResult } from "@/lib/types";
import { unique } from "@/lib/utils";

const popularSearches = ["patience", "salah", "repentance", "parents", "charity", "Musa", "Ramadan", "tawhid"];

export function SourceExplorer() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [directoryCategory, setDirectoryCategory] = useState("All");
  const [results, setResults] = useState<SourceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const directoryCategories = useMemo(
    () => ["All", ...unique(sourcesData.map((source) => source.category ?? "Other"))],
    []
  );
  const directory = useMemo(
    () => sourcesData.filter((source) => directoryCategory === "All" || source.category === directoryCategory),
    [directoryCategory]
  );

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("deen-source-searches") ?? "[]") as string[];
      setRecent(saved.slice(0, 5));
    } catch {
      setRecent([]);
    }
    const initialQuery = new URLSearchParams(window.location.search).get("query");
    if (initialQuery) setQuery(initialQuery);
  }, []);

  async function searchSources(event?: FormEvent, override?: string) {
    event?.preventDefault();
    const value = (override ?? query).trim();
    if (value.length < 2) return;
    setQuery(value);
    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ q: value, type });
      const response = await fetch(`/api/sources/search?${params.toString()}`);
      const data = (await response.json()) as { results?: SourceSearchResult[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results ?? []);
      const nextRecent = [value, ...recent.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 5);
      setRecent(nextRecent);
      localStorage.setItem("deen-source-searches", JSON.stringify(nextRecent));
    } catch (cause) {
      setResults([]);
      setError(cause instanceof Error ? cause.message : "Source search is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat icon={BookOpen} value="6,236" label="Quran ayahs indexed" />
        <Stat icon={LibraryBig} value="114" label="Surah source collections" />
        <Stat icon={ShieldCheck} value={String(sourcesData.length)} label="Curated source libraries" />
      </section>

      <Card>
        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold text-ink dark:text-white">Search the source index</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Search every English-translated Quran ayah plus the app’s learning, hadith, dua, ruling, and history references.
          </p>
        </div>
        <form onSubmit={searchSources} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search patience, prayer, family, a prophet, or a reference"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink dark:border-white/10 dark:bg-slate-950 dark:text-white"
            aria-label="Source type"
          >
            <option value="all">All sources</option>
            <option value="quran">Quran only</option>
            <option value="learning">Learning library</option>
          </select>
          <button type="submit" className="h-11 rounded-lg bg-reed px-5 text-sm font-medium text-white">
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {popularSearches.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => void searchSources(undefined, item)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-reed/30 hover:text-reed dark:border-white/10 dark:text-slate-300"
            >
              {item}
            </button>
          ))}
        </div>
        {recent.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            Recent:
            {recent.map((item) => (
              <button key={item} type="button" onClick={() => void searchSources(undefined, item)} className="hover:text-reed">
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </Card>

      {loading ? <LoadingState label="Searching Quran and learning sources" /> : null}
      {error ? <EmptyState title="Source search issue" body={error} /> : null}
      {!loading && !error && results.length ? (
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink dark:text-white">Search results</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">{results.length} found</span>
          </div>
          <div className="space-y-3">
            {results.map((result) => (
              <a
                key={result.id}
                href={result.url}
                target={result.url.startsWith("/") ? undefined : "_blank"}
                rel={result.url.startsWith("/") ? undefined : "noreferrer"}
                className="group block rounded-lg border border-slate-200/80 bg-white p-4 shadow-soft transition hover:border-reed/35 dark:border-white/10 dark:bg-white/[0.045]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{result.type}</Badge>
                      <span className="text-xs text-slate-400">{result.reference}</span>
                    </div>
                    <h3 className="mt-2 font-semibold text-ink group-hover:text-reed dark:text-white dark:group-hover:text-teal-200">
                      {result.title}
                    </h3>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-reed" aria-hidden="true" />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{result.excerpt}</p>
                <p className="mt-3 text-xs font-medium text-reed dark:text-teal-200">{result.provider}</p>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && !error && hasSearched && !results.length ? (
        <EmptyState title="No indexed sources found" body="Try a shorter keyword or another topic." />
      ) : null}

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink dark:text-white">Curated source directory</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Primary texts, reference databases, and clearly labeled learning organizations.
            </p>
          </div>
          <select
            value={directoryCategory}
            onChange={(event) => setDirectoryCategory(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink dark:border-white/10 dark:bg-slate-950 dark:text-white"
            aria-label="Directory category"
          >
            {directoryCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {directory.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-lg border border-slate-200/80 bg-white p-4 transition hover:border-reed/35 dark:border-white/10 dark:bg-white/[0.045]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge>{source.authority ?? "Reference"}</Badge>
                  <h3 className="mt-2 font-semibold text-ink group-hover:text-reed dark:text-white dark:group-hover:text-teal-200">
                    {source.name}
                  </h3>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{source.usage}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label
}: {
  icon: typeof BookOpen;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.045]">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-reed/10 text-reed dark:bg-teal-200/10 dark:text-teal-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-xl font-bold text-ink dark:text-white">{value}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{label}</span>
      </span>
    </div>
  );
}
