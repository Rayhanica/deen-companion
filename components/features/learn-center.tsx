"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenCheck, Bot, ChevronRight, Gavel, Landmark, LibraryBig, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/state";
import { deepLearningData, fatwasData, historyStoriesData, knowledgeData, sourcesData } from "@/lib/content";
import { SOURCE_DISCLAIMER } from "@/lib/constants";
import { cn, unique } from "@/lib/utils";

type LearnMode = "knowledge" | "lessons" | "fatwas" | "stories";

const modes: Array<{ id: LearnMode; label: string; description: string }> = [
  { id: "knowledge", label: "Knowledge", description: "Core Islamic topics" },
  { id: "lessons", label: "Arabic & Tajweed", description: "Step-by-step Quran reading" },
  { id: "fatwas", label: "Fatwa literacy", description: "Responsible ruling examples" },
  { id: "stories", label: "History & stories", description: "Seerah and Prophets" }
];

export function LearnCenter() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<LearnMode>("knowledge");
  const [filter, setFilter] = useState("All");
  const filters = useMemo(() => {
    if (mode === "lessons") return ["All", ...unique(deepLearningData.map((item) => item.track))];
    if (mode === "fatwas") return ["All", ...unique(fatwasData.map((item) => item.topic))];
    if (mode === "stories") return ["All", ...unique(historyStoriesData.map((item) => item.category))];
    return ["All", ...unique(knowledgeData.map((item) => item.topic))];
  }, [mode]);

  const articles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return knowledgeData.filter((article) => {
      const matchesTopic = filter === "All" || article.topic === filter;
      const haystack = [article.topic, article.title, article.summary, article.references.join(" ")].join(" ").toLowerCase();
      return matchesTopic && (!normalized || haystack.includes(normalized));
    });
  }, [filter, query]);

  const lessons = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return deepLearningData.filter((lesson) => {
      const matchesTrack = filter === "All" || lesson.track === filter;
      const haystack = [
        lesson.track,
        lesson.title,
        lesson.summary,
        lesson.objectives.join(" "),
        lesson.reading.join(" "),
        lesson.practice,
        lesson.references.join(" ")
      ]
        .join(" ")
        .toLowerCase();
      return matchesTrack && (!normalized || haystack.includes(normalized));
    });
  }, [filter, query]);

  const fatwas = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return fatwasData.filter((fatwa) => {
      const matchesTopic = filter === "All" || fatwa.topic === filter;
      const haystack = [fatwa.topic, fatwa.question, fatwa.answer, fatwa.references.join(" ")].join(" ").toLowerCase();
      return matchesTopic && (!normalized || haystack.includes(normalized));
    });
  }, [filter, query]);

  const stories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return historyStoriesData.filter((story) => {
      const matchesCategory = filter === "All" || story.category === filter;
      const haystack = [story.category, story.title, story.period, story.summary, story.lessons.join(" "), story.references.join(" ")]
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [filter, query]);

  function selectMode(nextMode: LearnMode) {
    setMode(nextMode);
    setFilter("All");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Learn"
        title="Guided Islamic learning"
        body="Arabic and Quran reading, tajweed rules, aqeedah, worship, fatwa literacy, hadith studies, Islamic history, seerah, and Prophets’ stories."
        actions={
          <>
            <Link href="/ai">
              <Button variant="secondary">
                <Bot className="h-4 w-4" aria-hidden="true" />
                AI guide
              </Button>
            </Link>
            <Link href="/find">
              <Button variant="secondary">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Find nearby
              </Button>
            </Link>
            <Link href="/learn/hadith">
              <Button>
                <LibraryBig className="h-4 w-4" aria-hidden="true" />
                Hadith
              </Button>
            </Link>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Learning tracks</CardTitle>
                <CardDescription>Choose the material you want to study.</CardDescription>
              </div>
              <BookOpenCheck className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="grid gap-2">
              {modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectMode(item.id)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition",
                    mode === item.id
                      ? "border-reed bg-reed text-white"
                      : "border-black/5 bg-white/70 text-slate-700 hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                  )}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={cn("mt-1 block text-xs", mode === item.id ? "text-white/75" : "text-slate-500 dark:text-slate-400")}>
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Search</CardTitle>
                <CardDescription>Find a topic, lesson, story, question, or reference.</CardDescription>
              </div>
              <Search className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="salah, repentance, parents"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>{mode === "lessons" ? "Tracks" : mode === "stories" ? "Categories" : "Topics"}</CardTitle>
                <CardDescription>{filters.length - 1} filters available.</CardDescription>
              </div>
              {mode === "fatwas" ? (
                <Gavel className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
              ) : mode === "stories" ? (
                <Landmark className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
              ) : (
                <BookOpenCheck className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
              )}
            </CardHeader>
            <div className="flex max-h-[520px] flex-col gap-2 overflow-auto pr-1">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={cn(
                    "flex min-h-10 items-center justify-between rounded-lg px-3 text-left text-sm font-medium transition",
                    filter === item
                      ? "bg-reed text-white"
                      : "bg-white/70 text-slate-700 hover:bg-reed/10 hover:text-reed dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  )}
                >
                  <span>{item}</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>Source policy</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{SOURCE_DISCLAIMER}</p>
            <div className="mt-4 space-y-2">
              {sourcesData.slice(0, 3).map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-black/5 bg-white/60 p-3 text-sm text-reed transition hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-teal-200"
                >
                  {source.name}
                </a>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {mode === "knowledge" && articles.length ? (
            articles.map((article) => (
              <Card key={article.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{article.topic}</Badge>
                      <Badge className="bg-saffron/10 text-saffron dark:text-amber-200">{article.level}</Badge>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-ink dark:text-white">{article.title}</h2>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{article.summary}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {article.steps.map((step) => (
                    <div key={step} className="rounded-lg bg-skysoft/55 p-3 text-sm leading-6 text-slate-700 dark:bg-white/8 dark:text-slate-200">
                      {step}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.references.map((reference) => (
                    <Badge key={reference}>{reference}</Badge>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">{article.disclaimer}</p>
              </Card>
            ))
          ) : null}

          {mode === "lessons" && lessons.length ? (
            lessons.map((lesson) => (
              <Card key={lesson.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{lesson.track}</Badge>
                  <Badge className="bg-saffron/10 text-saffron dark:text-amber-200">{lesson.level}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-ink dark:text-white">{lesson.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{lesson.summary}</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="rounded-lg bg-skysoft/55 p-4 dark:bg-white/8">
                    <p className="text-sm font-semibold text-ink dark:text-white">Objectives</p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      {lesson.objectives.map((objective) => (
                        <li key={objective}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    {lesson.reading.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-reed/15 bg-white/70 p-4 dark:border-teal-200/15 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-reed dark:text-teal-200">Practice</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{lesson.practice}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lesson.references.map((reference) => (
                    <Badge key={reference}>{reference}</Badge>
                  ))}
                </div>
              </Card>
            ))
          ) : null}

          {mode === "fatwas" && fatwas.length ? (
            fatwas.map((fatwa) => (
              <Card key={fatwa.id}>
                <Badge>{fatwa.topic}</Badge>
                <h2 className="mt-3 text-xl font-semibold text-ink dark:text-white">{fatwa.question}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{fatwa.answer}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {fatwa.references.map((reference) => (
                    <Badge key={reference}>{reference}</Badge>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">{fatwa.disclaimer}</p>
              </Card>
            ))
          ) : null}

          {mode === "stories" && stories.length ? (
            stories.map((story) => (
              <Card key={story.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{story.category}</Badge>
                  <Badge className="bg-saffron/10 text-saffron dark:text-amber-200">{story.period}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-ink dark:text-white">{story.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{story.summary}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {story.lessons.map((lesson) => (
                    <div key={lesson} className="rounded-lg bg-skysoft/55 p-3 text-sm leading-6 text-slate-700 dark:bg-white/8 dark:text-slate-200">
                      {lesson}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {story.references.map((reference) => (
                    <Badge key={reference}>{reference}</Badge>
                  ))}
                </div>
              </Card>
            ))
          ) : null}

          {((mode === "knowledge" && !articles.length) ||
            (mode === "lessons" && !lessons.length) ||
            (mode === "fatwas" && !fatwas.length) ||
            (mode === "stories" && !stories.length)) ? (
            <EmptyState title="No articles found" body="Try another topic or search term." />
          ) : null}
        </div>
      </section>
    </div>
  );
}
