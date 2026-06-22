"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookText, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { getDailyItem, hadithData } from "@/lib/content";
import type { Hadith } from "@/lib/types";
import { cn, unique } from "@/lib/utils";
import { useUserState } from "@/lib/user-state";

const collections = ["Bukhari", "Muslim", "Nawawi 40", "Riyad as-Salihin", "Tirmidhi", "Abu Dawud", "Ibn Majah"];

export function HadithLibrary() {
  const { state, toggleHadithBookmark } = useUserState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<Hadith[]>(hadithData);
  const [loading, setLoading] = useState(false);
  const categories = useMemo(() => ["all", ...unique(hadithData.map((item) => item.category))], []);
  const dailyHadith = getDailyItem(hadithData);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (category !== "all") params.set("category", category);
      setLoading(true);
      fetch(`/api/hadith/search?${params.toString()}`)
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Hadith search failed"))))
        .then((data: { results: Hadith[] }) => setResults(data.results))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [category, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Hadith"
        title="Library and daily reminder"
        body="Search hadith samples by keyword and category, bookmark narrations, and prepare for API-backed expansion."
      />

      <section className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Daily hadith</CardTitle>
                <CardDescription>{dailyHadith.reference}</CardDescription>
              </div>
              <Sparkles className="h-6 w-6 text-saffron" aria-hidden="true" />
            </CardHeader>
            <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{dailyHadith.text}</p>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Search</CardTitle>
                <CardDescription>Faith, salah, character, family, charity, repentance, death, marriage.</CardDescription>
              </div>
              <Search className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="intention, charity, parents"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    category === item
                      ? "border-reed bg-reed text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-reed/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Collections</CardTitle>
                <CardDescription>Expansion targets for a full library.</CardDescription>
              </div>
              <BookText className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="grid grid-cols-2 gap-2">
              {collections.map((collection) => (
                <div key={collection} className="rounded-lg bg-skysoft/55 p-3 text-sm font-medium text-ink dark:bg-white/8 dark:text-white">
                  {collection}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {loading ? <LoadingState label="Searching hadith" /> : null}
          {!loading && results.length ? (
            results.map((hadith) => {
              const saved = state.hadithBookmarks.includes(hadith.id);
              return (
                <Card key={hadith.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{hadith.category}</Badge>
                        <Badge>{hadith.collection}</Badge>
                      </div>
                      <h2 className="mt-3 text-xl font-semibold text-ink dark:text-white">{hadith.title}</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={saved ? "Remove hadith bookmark" : "Bookmark hadith"}
                      onClick={() => toggleHadithBookmark(hadith.id)}
                    >
                      <Bookmark
                        className={cn("h-5 w-5", saved && "fill-reed text-reed dark:fill-teal-200 dark:text-teal-200")}
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-200">{hadith.text}</p>
                  <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">{hadith.reference}</p>
                </Card>
              );
            })
          ) : null}
          {!loading && !results.length ? (
            <EmptyState title="No hadith found" body="Try another keyword or category." />
          ) : null}
        </div>
      </section>
    </div>
  );
}
