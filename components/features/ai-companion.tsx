"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Bot, BookOpenCheck, Check, Copy, Database, Globe2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useUserState } from "@/lib/user-state";

type AiResult = {
  mode: "local" | "research" | "ai" | "ai-web";
  answer: string;
  warning?: string;
  citations?: Array<{ title: string; url: string }>;
  capabilities?: AiCapabilities;
  confidence?: { level: "high" | "medium" | "low" | "insufficient"; basis: string };
  scholarlyDifferences?: { status: string; note: string };
};

type AiCapabilities = {
  generativeAi: boolean;
  sourceResearch: boolean;
  quranAyahsIndexed: number;
  model: string;
};

const prompts = [
  "Build me a 7-day beginner Quran reading plan.",
  "Explain noon sakinah and tanween simply.",
  "What should I learn before asking a fatwa?",
  "Give me a seerah reading path for this week."
];

const companionModes = [
  "Quick Answer",
  "Detailed Research",
  "Quran Study",
  "Hadith Study",
  "Memorization Coach",
  "Arabic Tutor",
  "Tajweed Coach",
  "New Muslim Guide",
  "Parenting Advisor",
  "Student of Knowledge",
  "Fatwa Comparison"
];

export function AiCompanion() {
  const { state } = useUserState();
  const [question, setQuestion] = useState(prompts[0]);
  const [mode, setMode] = useState("Quick Answer");
  const [focus, setFocus] = useState("Quran");
  const [level, setLevel] = useState("Beginner");
  const [enableWeb, setEnableWeb] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [capabilities, setCapabilities] = useState<AiCapabilities | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/ai/companion")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Status unavailable"))))
      .then((data: AiCapabilities) => setCapabilities(data))
      .catch(() => setCapabilities(null));
  }, []);

  async function ask(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const response = await fetch("/api/ai/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          mode,
          focus,
          level,
          enableWeb,
          profile: {
            bookmarks: state.ayahBookmarks.length + state.hadithBookmarks.length + state.duaFavorites.length,
            memorized: state.memorizedAyahs.length,
            dailyGoal: state.preferences.dailyQuranMinutes
          }
        })
      });
      const data = (await response.json()) as AiResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "The guide could not answer right now.");
      setResult(data);
      if (data.capabilities) setCapabilities(data.capabilities);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The guide could not answer right now.");
    } finally {
      setLoading(false);
    }
  }

  async function copyAnswer() {
    if (!result?.answer) return;
    await navigator.clipboard.writeText(result.answer);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Ask Deen Companion"
        title="Your personal mu’allim and research guide"
        body="Ask for Quran, Arabic, tajweed, hadith, history, or habit guidance. Reviewed local search always works; GPT-powered answers and live web research activate when an OpenAI key is configured."
        actions={
          <Link
            href="/learn?mode=sources"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <Database className="h-4 w-4" aria-hidden="true" />
            Source library
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Guide status</CardTitle>
                <CardDescription>
                  {capabilities?.generativeAi
                    ? `${capabilities.model} is connected.`
                    : "Reviewed source-search is active. GPT generation needs a server API key."}
                </CardDescription>
              </div>
              <Badge>{capabilities?.generativeAi ? "AI ready" : "Source mode"}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-[#f3f7f4] p-3 dark:bg-white/[0.045]">
                <p className="font-semibold text-ink dark:text-white">Quran index</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  {capabilities?.quranAyahsIndexed?.toLocaleString() ?? "6,236"} ayahs
                </p>
              </div>
              <div className="rounded-lg bg-[#f3f7f4] p-3 dark:bg-white/[0.045]">
                <p className="font-semibold text-ink dark:text-white">Web research</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  {capabilities?.generativeAi ? "GPT citations" : "Quran + library"}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Ask a question</CardTitle>
                <CardDescription>For learning support, planning, and source-aware study prompts.</CardDescription>
              </div>
              <Bot className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <form onSubmit={ask} className="space-y-3">
              <label className="block text-sm font-medium text-ink dark:text-white">
                Mode
                <select
                  value={mode}
                  onChange={(event) => {
                    const nextMode = event.target.value;
                    setMode(nextMode);
                    setEnableWeb(nextMode === "Detailed Research" || nextMode === "Fatwa Comparison");
                  }}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  {companionModes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                placeholder="Ask for a learning plan or explanation"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={focus}
                  onChange={(event) => setFocus(event.target.value)}
                  className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option>Quran</option>
                  <option>Arabic</option>
                  <option>Tajweed</option>
                  <option>Hadith</option>
                  <option>Fatwa literacy</option>
                  <option>History</option>
                  <option>Daily worship</option>
                </select>
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Family</option>
                  <option>Hifz student</option>
                  <option>Convert</option>
                </select>
              </div>
              <label className="flex items-center justify-between gap-3 rounded-lg border border-black/5 bg-white/70 p-3 text-sm font-medium text-ink dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
                <span className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-reed dark:text-teal-200" aria-hidden="true" />
                  {capabilities?.generativeAi ? "Live AI web research" : "Search Quran and sources"}
                </span>
                <input
                  type="checkbox"
                  checked={enableWeb}
                  onChange={(event) => setEnableWeb(event.target.checked)}
                  className="h-5 w-5 accent-reed"
                />
              </label>
              <Button type="submit" className="w-full" disabled={loading}>
                <Send className="h-4 w-4" aria-hidden="true" />
                {loading ? "Thinking..." : "Ask"}
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Quick prompts</CardTitle>
                <CardDescription>Tap one and ask.</CardDescription>
              </div>
              <BookOpenCheck className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="space-y-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuestion(prompt)}
                  className="w-full rounded-lg border border-black/5 bg-white/70 p-3 text-left text-sm text-slate-700 transition hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Guidance</CardTitle>
                <CardDescription>
                  {result
                    ? result.mode === "local"
                      ? "Reviewed local content"
                      : result.mode === "research"
                        ? "Quran and source research"
                        : "OpenAI response"
                    : "Ask a question to begin."}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {result ? (
                  <Button variant="ghost" size="icon" onClick={copyAnswer} aria-label="Copy answer" title="Copy answer">
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                ) : null}
                {result ? <Badge>{result.mode}</Badge> : null}
              </div>
            </CardHeader>
            {error ? <p className="mb-4 rounded-lg bg-clay/10 p-3 text-sm text-clay">{error}</p> : null}
            {result ? (
              <div className="space-y-4">
                {result.warning ? (
                  <p className="rounded-lg bg-saffron/10 p-3 text-sm text-slate-700 dark:text-amber-100">{result.warning}</p>
                ) : null}
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">{result.answer}</p>
                {result.confidence ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-[#f3f7f4] p-3 dark:bg-white/[0.045]">
                      <p className="text-xs font-semibold uppercase text-reed dark:text-teal-200">Confidence · {result.confidence.level}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{result.confidence.basis}</p>
                    </div>
                    {result.scholarlyDifferences ? (
                      <div className="rounded-lg bg-[#f3f7f4] p-3 dark:bg-white/[0.045]">
                        <p className="text-xs font-semibold uppercase text-reed dark:text-teal-200">Scholarly differences</p>
                        <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{result.scholarlyDifferences.note}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {result.citations?.length ? (
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">Sources</p>
                    <div className="mt-2 space-y-2">
                      {result.citations.map((citation, index) => (
                        <a
                          key={citation.url}
                          href={citation.url}
                          target={citation.url.startsWith("/") ? undefined : "_blank"}
                          rel={citation.url.startsWith("/") ? undefined : "noreferrer"}
                          className="block rounded-lg border border-black/5 bg-white/70 p-3 text-sm text-reed transition hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-teal-200"
                        >
                          <span className="mr-2 font-semibold">[{index + 1}]</span>
                          {citation.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                The AI guide can personalize study based on saved progress. It is for learning support only and does not replace a qualified scholar.
              </p>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
