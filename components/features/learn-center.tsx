"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  Bot,
  ChevronDown,
  ChevronRight,
  Database,
  ExternalLink,
  Gavel,
  Landmark,
  LibraryBig,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ReferenceLinks } from "@/components/ui/reference-links";
import { EmptyState } from "@/components/ui/state";
import { SourceExplorer } from "@/components/features/source-explorer";
import {
  deepLearningData,
  fatwasData,
  historyStoriesData,
  sourcesData,
  studyGuidesData
} from "@/lib/content";
import { SOURCE_DISCLAIMER } from "@/lib/constants";
import { cn, unique } from "@/lib/utils";

type LearnMode = "knowledge" | "lessons" | "fatwas" | "stories" | "sources";

const modes: Array<{ id: LearnMode; label: string; description: string; icon: typeof BookOpenCheck }> = [
  { id: "knowledge", label: "Knowledge base", description: "Faith, worship and daily life", icon: BookOpenCheck },
  { id: "lessons", label: "Arabic & Tajweed", description: "A sequenced Quran curriculum", icon: LibraryBig },
  { id: "fatwas", label: "Rulings guide", description: "General answers and fatwa literacy", icon: Gavel },
  { id: "stories", label: "History & stories", description: "Prophets, seerah and Muslim history", icon: Landmark },
  { id: "sources", label: "Source library", description: "6,236 ayahs and linked references", icon: Database }
];

export function LearnCenter() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<LearnMode>("knowledge");
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(studyGuidesData[0]?.id ?? null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("mode") as LearnMode | null;
    const resource = params.get("resource");
    if (requestedMode && modes.some((item) => item.id === requestedMode)) {
      setMode(requestedMode);
      setFilter("All");
    }
    if (resource) {
      setExpandedId(resource);
      window.setTimeout(() => document.getElementById(resource)?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, []);

  const filters = useMemo(() => {
    if (mode === "sources") return ["All"];
    if (mode === "lessons") return ["All", ...unique(deepLearningData.map((item) => item.track))];
    if (mode === "fatwas") return ["All", ...unique(fatwasData.map((item) => item.topic))];
    if (mode === "stories") return ["All", ...unique(historyStoriesData.map((item) => item.category))];
    return ["All", ...unique(studyGuidesData.map((item) => item.topic))];
  }, [mode]);

  const articles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return studyGuidesData.filter((article) => {
      const matchesTopic = filter === "All" || article.topic === filter;
      const haystack = [
        article.topic,
        article.title,
        article.overview,
        article.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])]).join(" "),
        article.references.join(" ")
      ]
        .join(" ")
        .toLowerCase();
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

  const resultCount =
    mode === "knowledge"
      ? articles.length
      : mode === "lessons"
        ? lessons.length
        : mode === "fatwas"
          ? fatwas.length
          : mode === "stories"
            ? stories.length
            : 6236;

  function selectMode(nextMode: LearnMode) {
    setMode(nextMode);
    setFilter("All");
    setExpandedId(null);
  }

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Learn"
        title="Build knowledge step by step"
        body="Structured beginner lessons, detailed reading, source references, and practical study prompts."
        actions={
          <>
            <Link
              href="/learn/paths"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-reed px-4 text-sm font-medium text-white"
            >
              <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              Learning paths
            </Link>
            <Link
              href="/learn/hadith"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <LibraryBig className="h-4 w-4" aria-hidden="true" />
              Hadith library
            </Link>
            <Link
              href="/ai"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <Bot className="h-4 w-4" aria-hidden="true" />
              Ask study guide
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5" aria-label="Learning tracks">
        {modes.map((item) => {
          const Icon = item.icon;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectMode(item.id)}
              className={cn(
                "flex min-h-28 items-start gap-3 rounded-lg border p-3 text-left transition sm:p-4 xl:min-h-24",
                item.id === "sources" && "col-span-2 xl:col-span-1",
                active
                  ? "border-reed bg-reed text-white"
                  : "border-slate-200 bg-white hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.045]"
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", active ? "text-white" : "text-reed dark:text-teal-200")} aria-hidden="true" />
              <span>
                <span className={cn("block text-sm font-semibold", active ? "text-white" : "text-ink dark:text-white")}>{item.label}</span>
                <span className={cn("mt-1 block text-xs leading-5", active ? "text-white/70" : "text-slate-500 dark:text-slate-400")}>
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </section>

      {mode === "sources" ? <SourceExplorer /> : null}

      {mode !== "sources" ? (
      <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search topics, lessons, questions or references"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400">{resultCount} resources</p>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "h-9 shrink-0 rounded-lg border px-3 text-sm font-medium transition",
                filter === item
                  ? "border-reed bg-reed text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-reed/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      ) : null}

      {mode !== "sources" ? (
      <section className="mt-5 space-y-3">
        {mode === "knowledge"
          ? articles.map((article) => {
              const expanded = expandedId === article.id;
              return (
                <Card key={article.id} id={article.id} className="scroll-mt-24 p-0">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(article.id)}
                    className="flex w-full items-start justify-between gap-4 p-5 text-left"
                    aria-expanded={expanded}
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge>{article.topic}</Badge>
                        <Badge className="bg-saffron/10 text-saffron dark:text-amber-200">{article.level}</Badge>
                      </span>
                      <span className="mt-3 block text-lg font-semibold text-ink dark:text-white">{article.title}</span>
                      <span className="mt-2 block max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300">{article.overview}</span>
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-reed/10 text-reed dark:bg-teal-200/10 dark:text-teal-200">
                      <ChevronDown className={cn("h-5 w-5 transition", expanded && "rotate-180")} aria-hidden="true" />
                    </span>
                  </button>

                  {expanded ? (
                    <div className="border-t border-slate-100 px-5 pb-6 pt-5 dark:border-white/10">
                      <div className="content-prose max-w-4xl space-y-7">
                        {article.sections.map((section) => (
                          <section key={section.heading}>
                            <h3 className="text-base font-semibold text-ink dark:text-white">{section.heading}</h3>
                            <div className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
                              {section.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                              ))}
                              {section.bullets?.length ? (
                                <ul>
                                  {section.bullets.map((bullet) => (
                                    <li key={bullet}>{bullet}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          </section>
                        ))}
                      </div>
                      <ReferenceBlock references={article.references} note={article.sourceNote} />
                      <div className="mt-4 flex flex-wrap gap-2">
                        {article.related.map((item) => (
                          <span key={item} className="text-xs text-slate-500 dark:text-slate-400">
                            Related: {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </Card>
              );
            })
          : null}

        {mode === "lessons"
          ? lessons.map((lesson, index) => {
              const expanded = expandedId === lesson.id;
              return (
                <Card key={lesson.id} id={lesson.id} className="scroll-mt-24 p-0">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(lesson.id)}
                    className="flex w-full items-start justify-between gap-4 p-5 text-left"
                    aria-expanded={expanded}
                  >
                    <span className="flex min-w-0 gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-reed/10 text-sm font-bold text-reed dark:bg-teal-200/10 dark:text-teal-200">
                        {index + 1}
                      </span>
                      <span>
                        <span className="flex flex-wrap items-center gap-2">
                          <Badge>{lesson.track}</Badge>
                          <Badge className="bg-saffron/10 text-saffron dark:text-amber-200">{lesson.level}</Badge>
                        </span>
                        <span className="mt-3 block text-lg font-semibold text-ink dark:text-white">{lesson.title}</span>
                        <span className="mt-2 block max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300">{lesson.summary}</span>
                      </span>
                    </span>
                    <ChevronDown className={cn("mt-2 h-5 w-5 shrink-0 text-slate-400 transition", expanded && "rotate-180")} aria-hidden="true" />
                  </button>

                  {expanded ? (
                    <div className="border-t border-slate-100 px-5 pb-6 pt-5 dark:border-white/10">
                      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
                        <div>
                          <h3 className="text-sm font-semibold text-ink dark:text-white">Learning objectives</h3>
                          <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                            {lesson.objectives.map((objective) => (
                              <li key={objective} className="flex gap-2">
                                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-reed dark:text-teal-200" aria-hidden="true" />
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="content-prose text-sm leading-7 text-slate-700 dark:text-slate-200">
                          {lesson.reading.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                      <div className="mt-5 rounded-lg border border-reed/15 bg-[#f3f7f4] p-4 dark:border-teal-200/15 dark:bg-white/[0.045]">
                        <p className="text-sm font-semibold text-reed dark:text-teal-200">Practice</p>
                        <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{lesson.practice}</p>
                      </div>
                      <ReferenceBlock references={lesson.references} />
                    </div>
                  ) : null}
                </Card>
              );
            })
          : null}

        {mode === "fatwas"
          ? fatwas.map((fatwa) => {
              const expanded = expandedId === fatwa.id;
              return (
                <Card key={fatwa.id} id={fatwa.id} className="scroll-mt-24 p-0">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(fatwa.id)}
                    className="flex w-full items-start justify-between gap-4 p-5 text-left"
                    aria-expanded={expanded}
                  >
                    <span>
                      <Badge>{fatwa.topic}</Badge>
                      <span className="mt-3 block text-lg font-semibold text-ink dark:text-white">{fatwa.question}</span>
                    </span>
                    <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition", expanded && "rotate-180")} aria-hidden="true" />
                  </button>
                  {expanded ? (
                    <div className="border-t border-slate-100 px-5 pb-6 pt-5 dark:border-white/10">
                      <p className="max-w-4xl text-sm leading-7 text-slate-700 dark:text-slate-200">{fatwa.answer}</p>
                      <ReferenceBlock references={fatwa.references} note={fatwa.disclaimer} />
                    </div>
                  ) : null}
                </Card>
              );
            })
          : null}

        {mode === "stories"
          ? stories.map((story) => {
              const expanded = expandedId === story.id;
              return (
                <Card key={story.id} id={story.id} className="scroll-mt-24 p-0">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(story.id)}
                    className="flex w-full items-start justify-between gap-4 p-5 text-left"
                    aria-expanded={expanded}
                  >
                    <span>
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge>{story.category}</Badge>
                        <Badge className="bg-saffron/10 text-saffron dark:text-amber-200">{story.period}</Badge>
                      </span>
                      <span className="mt-3 block text-lg font-semibold text-ink dark:text-white">{story.title}</span>
                      <span className="mt-2 block max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300">{story.summary}</span>
                    </span>
                    <ChevronDown className={cn("mt-2 h-5 w-5 shrink-0 text-slate-400 transition", expanded && "rotate-180")} aria-hidden="true" />
                  </button>
                  {expanded ? (
                    <div className="border-t border-slate-100 px-5 pb-6 pt-5 dark:border-white/10">
                      <h3 className="text-sm font-semibold text-ink dark:text-white">Lessons to carry forward</h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {story.lessons.map((lesson) => (
                          <div key={lesson} className="rounded-lg bg-[#f3f7f4] p-4 text-sm leading-6 text-slate-700 dark:bg-white/[0.045] dark:text-slate-200">
                            {lesson}
                          </div>
                        ))}
                      </div>
                      <ReferenceBlock references={story.references} />
                    </div>
                  ) : null}
                </Card>
              );
            })
          : null}

        {resultCount === 0 ? <EmptyState title="No resources found" body="Try another topic or search term." /> : null}
      </section>
      ) : null}

      <aside className="mt-7 rounded-lg border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-sm font-semibold text-ink dark:text-white">Source and ruling policy</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{SOURCE_DISCLAIMER}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sourcesData.slice(0, 4).map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-reed hover:border-reed/30 dark:border-white/10 dark:text-teal-200"
              >
                {source.name}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function ReferenceBlock({ references, note }: { references: string[]; note?: string }) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-4 dark:border-white/10">
      <p className="text-xs font-semibold uppercase text-slate-400">References</p>
      <ReferenceLinks references={references} className="mt-2 sm:grid-cols-2 xl:grid-cols-3" compact />
      {note ? <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{note}</p> : null}
    </div>
  );
}
