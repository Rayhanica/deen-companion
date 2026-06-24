"use client";

import { useEffect, useState } from "react";
import { Award, BookOpenCheck, Check, ChevronDown, Clock3, GraduationCap, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress";
import { learningPathsData } from "@/lib/content";
import { useUserState } from "@/lib/user-state";
import { cn, percentage, toggleValue } from "@/lib/utils";

export function LearningPaths() {
  const { state, updateState } = useUserState();
  const [expandedId, setExpandedId] = useState<string | null>(learningPathsData[0]?.id ?? null);

  useEffect(() => {
    const path = new URLSearchParams(window.location.search).get("path");
    if (path) {
      setExpandedId(path);
      window.setTimeout(() => document.getElementById(path)?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, []);

  function toggleEnrollment(id: string) {
    updateState((current) => ({
      ...current,
      enrolledPaths: toggleValue(current.enrolledPaths ?? [], id)
    }));
  }

  function toggleLesson(pathId: string, lesson: string) {
    const key = `${pathId}:${lesson}`;
    updateState((current) => ({
      ...current,
      completedLessons: toggleValue(current.completedLessons ?? [], key)
    }));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Learning paths"
        title="Follow a clear curriculum"
        body="Structured programs for new Muslims, Quran readers, hifz students, families, and serious students of knowledge."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Route} value={String(learningPathsData.length)} label="Structured paths" />
        <Stat icon={BookOpenCheck} value={String(learningPathsData.reduce((sum, path) => sum + path.lessonCount, 0))} label="Planned lessons" />
        <Stat icon={Award} value={String(state.completedLessons?.length ?? 0)} label="Lessons completed" />
      </section>

      <section className="mt-6 space-y-3">
        {learningPathsData.map((path) => {
          const expanded = expandedId === path.id;
          const enrolled = (state.enrolledPaths ?? []).includes(path.id);
          const lessonKeys = path.modules.flatMap((module) => module.lessons.map((lesson) => `${path.id}:${lesson}`));
          const completed = lessonKeys.filter((key) => (state.completedLessons ?? []).includes(key)).length;
          const progress = percentage(completed, lessonKeys.length);

          return (
            <Card key={path.id} id={path.id} className="scroll-mt-28 p-0">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : path.id)}
                className="flex w-full items-start justify-between gap-4 p-5 text-left"
                aria-expanded={expanded}
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge>{path.level}</Badge>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {path.durationWeeks} weeks
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{path.lessonCount} lessons</span>
                  </span>
                  <span className="mt-3 block text-lg font-semibold text-ink dark:text-white">{path.title}</span>
                  <span className="mt-1 block text-xs font-medium text-reed dark:text-teal-200">{path.audience}</span>
                  <span className="mt-2 block max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">{path.description}</span>
                  {enrolled ? (
                    <span className="mt-4 block max-w-md">
                      <span className="flex justify-between text-xs text-slate-500">
                        <span>{completed} completed</span>
                        <span>{progress}%</span>
                      </span>
                      <ProgressBar value={progress} className="mt-2" />
                    </span>
                  ) : null}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-reed/10 text-reed dark:text-teal-200">
                  <ChevronDown className={cn("h-5 w-5 transition", expanded && "rotate-180")} aria-hidden="true" />
                </span>
              </button>

              {expanded ? (
                <div className="border-t border-slate-100 px-5 pb-6 pt-5 dark:border-white/10">
                  <div className="grid gap-5 lg:grid-cols-[0.65fr_1.35fr]">
                    <div>
                      <h3 className="text-sm font-semibold text-ink dark:text-white">Learning outcomes</h3>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                        {path.outcomes.map((outcome) => (
                          <li key={outcome} className="flex gap-2">
                            <Check className="mt-1 h-4 w-4 shrink-0 text-reed dark:text-teal-200" aria-hidden="true" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => toggleEnrollment(path.id)}
                        className={cn(
                          "mt-5 h-10 rounded-lg px-4 text-sm font-medium",
                          enrolled
                            ? "border border-reed/20 bg-white text-reed dark:bg-white/5 dark:text-teal-200"
                            : "bg-reed text-white"
                        )}
                      >
                        {enrolled ? "Leave path" : "Start this path"}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {path.modules.map((module, moduleIndex) => (
                        <section key={module.title} className="rounded-lg border border-slate-200/80 p-4 dark:border-white/10">
                          <p className="text-xs font-semibold uppercase text-reed dark:text-teal-200">Module {moduleIndex + 1}</p>
                          <h3 className="mt-1 font-semibold text-ink dark:text-white">{module.title}</h3>
                          <div className="mt-3 divide-y divide-slate-100 dark:divide-white/10">
                            {module.lessons.map((lesson) => {
                              const key = `${path.id}:${lesson}`;
                              const done = (state.completedLessons ?? []).includes(key);
                              return (
                                <button
                                  key={lesson}
                                  type="button"
                                  disabled={!enrolled}
                                  onClick={() => toggleLesson(path.id, lesson)}
                                  className="flex min-h-10 w-full items-center justify-between gap-3 py-2 text-left text-sm disabled:opacity-60"
                                >
                                  <span className={done ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"}>{lesson}</span>
                                  <span
                                    className={cn(
                                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                                      done ? "border-reed bg-reed text-white" : "border-slate-300 text-transparent dark:border-slate-600"
                                    )}
                                  >
                                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof GraduationCap; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.045]">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-reed/10 text-reed dark:text-teal-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-xl font-bold text-ink dark:text-white">{value}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{label}</span>
      </span>
    </div>
  );
}
