"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock3, FileText, Search, StickyNote, X } from "lucide-react";
import type { SourceSearchResult } from "@/lib/types";
import { useUserState } from "@/lib/user-state";

const scopes = [
  { value: "all", label: "Everything" },
  { value: "quran", label: "Quran" },
  { value: "hadith", label: "Hadith" },
  { value: "course", label: "Courses" },
  { value: "lesson", label: "Articles & lessons" },
  { value: "fatwa", label: "Rulings" },
  { value: "community", label: "Community" }
];

export function GlobalSearch() {
  const { state, updateState } = useUserState();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SourceSearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const personalResults = useMemo<SourceSearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    const needle = query.toLowerCase();
    const ayahNotes = Object.entries(state.ayahNotes)
      .filter(([, note]) => note.toLowerCase().includes(needle))
      .map(([key, note]) => ({
        id: `note-${key}`,
        type: "note" as const,
        title: `Quran note · ${key}`,
        excerpt: note,
        reference: "Personal knowledge vault",
        url: `/quran?ayah=${key}`,
        provider: "Private note"
      }));
    const vault = (state.personalVault ?? [])
      .filter((item) => `${item.title} ${item.body} ${item.tags.join(" ")}`.toLowerCase().includes(needle))
      .map((item) => ({
        id: `vault-${item.id}`,
        type: "note" as const,
        title: item.title,
        excerpt: item.body,
        reference: item.tags.join(" · ") || "Personal note",
        url: "/profile#knowledge-vault",
        provider: "Private knowledge vault"
      }));
    return [...ayahNotes, ...vault].slice(0, 8);
  }, [query, state.ayahNotes, state.personalVault]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        setOpen(true);
        window.setTimeout(() => containerRef.current?.querySelector("input")?.focus(), 0);
      }
      if (event.key === "Escape") setOpen(false);
    }
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    window.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("mousedown", handleClick);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}&scope=${scope}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Search failed"))))
        .then((data: { results: SourceSearchResult[] }) => setResults(data.results))
        .catch(() => {
          if (!controller.signal.aborted) setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 220);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, scope]);

  function rememberSearch() {
    const value = query.trim();
    if (!value) return;
    updateState((current) => ({
      ...current,
      recentSearches: [value, ...(current.recentSearches ?? []).filter((item) => item !== value)].slice(0, 8)
    }));
  }

  const combined = [...personalResults, ...results].slice(0, 12);

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder="Search Quran, hadith, courses, rulings, notes..."
          aria-label="Search Deen Companion"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-ink outline-none focus:border-reed focus:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 xl:block">
            /
          </span>
        )}
      </label>

      {open ? (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-[min(70vh,620px)] overflow-auto rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#17201c]">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            {scopes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setScope(item.value)}
                className={`h-8 shrink-0 rounded-md px-3 text-xs font-medium ${
                  scope === item.value
                    ? "bg-reed text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {query.trim().length < 2 ? (
            <div className="py-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                Recent searches
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(state.recentSearches ?? []).length ? (
                  (state.recentSearches ?? []).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setQuery(item)}
                      className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300"
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Search across worship, learning, community, and your private notes.</p>
                )}
              </div>
            </div>
          ) : loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Searching Deen Companion...</p>
          ) : combined.length ? (
            <div className="space-y-1 pt-2">
              {combined.map((result) => (
                <Link
                  key={result.id}
                  href={result.url}
                  onClick={() => {
                    rememberSearch();
                    setOpen(false);
                  }}
                  className="flex gap-3 rounded-lg p-3 transition hover:bg-reed/5 dark:hover:bg-white/5"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-reed/10 text-reed dark:text-teal-200">
                    {result.type === "quran" || result.type === "hadith" ? (
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                    ) : result.type === "note" ? (
                      <StickyNote className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink dark:text-white">{result.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {result.excerpt}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">No matching results. Try a shorter phrase.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
