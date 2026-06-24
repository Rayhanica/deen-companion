"use client";

import { FormEvent, useMemo, useState } from "react";
import { Database, FileJson, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  duasData,
  goalsData,
  hadithData,
  islamicCalendarData,
  communityData,
  knowledgeData,
  learningPathsData,
  sourcesData,
  tajweedData
} from "@/lib/content";

const contentSets = [
  { name: "Duas", path: "content/duas.json", count: duasData.length },
  { name: "Hadith samples", path: "content/hadith.json", count: hadithData.length },
  { name: "Knowledge articles", path: "content/knowledge.json", count: knowledgeData.length },
  { name: "Tajweed lessons", path: "content/tajweed.json", count: tajweedData.length },
  { name: "Daily goals", path: "content/goals.json", count: goalsData.length },
  { name: "Islamic dates", path: "content/islamic-calendar.json", count: islamicCalendarData.length },
  { name: "Sources", path: "content/sources.json", count: sourcesData.length },
  { name: "Learning paths", path: "content/learning-paths.json", count: learningPathsData.length },
  { name: "Community seeds", path: "content/community.json", count: communityData.length }
];

export function AdminContent() {
  const [type, setType] = useState("knowledge");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [reference, setReference] = useState("");

  const generated = useMemo(() => {
    if (!title.trim()) return "";
    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return JSON.stringify(
      {
        id: slug,
        type,
        title: title.trim(),
        category: category.trim(),
        summary: body.trim(),
        references: reference
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        disclaimer: "For personal learning. Ask a qualified scholar for specific rulings."
      },
      null,
      2
    );
  }, [body, category, reference, title, type]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Editorial and scholar review"
        body="Draft locally, migrate to relational content records, attach exact sources, request qualified review, and publish only verified versions."
      />

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Content files</CardTitle>
                <CardDescription>Bootstrap content pending database ingestion.</CardDescription>
              </div>
              <Database className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="space-y-2">
              {contentSets.map((set) => (
                <div key={set.path} className="rounded-lg border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-ink dark:text-white">{set.name}</p>
                    <Badge>{set.count}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{set.path}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Review rules</CardTitle>
                <CardDescription>Recommended before publishing.</CardDescription>
              </div>
              <ShieldCheck className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <ul className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
              <li>Record license and provenance before importing source text.</li>
              <li>Attach exact Quran, hadith, book, or institutional references.</li>
              <li>Label consensus, majority, minority, and individual opinions explicitly.</li>
              <li>Require qualified review for theology, rulings, finance, family, and medical topics.</li>
              <li>Show whether content is classical, editorial, community submitted, or AI assisted.</li>
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Add content draft</CardTitle>
                <CardDescription>Generate a structured entry for the JSON files.</CardDescription>
              </div>
              <Plus className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink dark:text-white">
                Type
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option value="knowledge">Knowledge</option>
                  <option value="dua">Dua</option>
                  <option value="hadith">Hadith</option>
                  <option value="tajweed">Tajweed</option>
                </select>
              </label>
              <label className="text-sm font-medium text-ink dark:text-white">
                Category
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  placeholder="salah"
                />
              </label>
              <label className="text-sm font-medium text-ink dark:text-white sm:col-span-2">
                Title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  placeholder="Article or dua title"
                />
              </label>
              <label className="text-sm font-medium text-ink dark:text-white sm:col-span-2">
                Body
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  placeholder="Simple sourced explanation"
                />
              </label>
              <label className="text-sm font-medium text-ink dark:text-white sm:col-span-2">
                References
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  placeholder="Quran 4:103, Bukhari 8"
                />
              </label>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Generated JSON</CardTitle>
                <CardDescription>Append to the matching content file after review.</CardDescription>
              </div>
              <FileJson className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <pre className="max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {generated || "Fill in a title to generate an entry."}
            </pre>
          </Card>
        </div>
      </section>
    </div>
  );
}
