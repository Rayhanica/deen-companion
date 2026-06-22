"use client";

import { FormEvent, useState } from "react";
import { Bot, BookOpenCheck, Globe2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useUserState } from "@/lib/user-state";

type AiResult = {
  mode: "local" | "ai" | "ai-web";
  answer: string;
  warning?: string;
  citations: Array<{ title: string; url: string }>;
};

const prompts = [
  "Build me a 7-day beginner Quran reading plan.",
  "Explain noon sakinah and tanween simply.",
  "What should I learn before asking a fatwa?",
  "Give me a seerah reading path for this week."
];

export function AiCompanion() {
  const { state } = useUserState();
  const [question, setQuestion] = useState(prompts[0]);
  const [focus, setFocus] = useState("Quran");
  const [level, setLevel] = useState("Beginner");
  const [enableWeb, setEnableWeb] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);

  async function ask(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/ai/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
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
      const data = (await response.json()) as AiResult;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI guide"
        title="Personalized learning companion"
        body="Ask for Quran, Arabic, tajweed, hadith, fatwa-literacy, history, or habit guidance. It uses local content by default and can use live web search when an OpenAI key is configured."
      />

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Ask a question</CardTitle>
                <CardDescription>For learning support, planning, and source-aware study prompts.</CardDescription>
              </div>
              <Bot className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <form onSubmit={ask} className="space-y-3">
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
                  Live web browsing
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
                  {result ? (result.mode === "local" ? "Local content mode" : "AI mode") : "Ask a question to begin."}
                </CardDescription>
              </div>
              {result ? <Badge>{result.mode}</Badge> : null}
            </CardHeader>
            {result ? (
              <div className="space-y-4">
                {result.warning ? (
                  <p className="rounded-lg bg-saffron/10 p-3 text-sm text-slate-700 dark:text-amber-100">{result.warning}</p>
                ) : null}
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">{result.answer}</p>
                {result.citations.length ? (
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">Sources</p>
                    <div className="mt-2 space-y-2">
                      {result.citations.map((citation) => (
                        <a
                          key={citation.url}
                          href={citation.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg border border-black/5 bg-white/70 p-3 text-sm text-reed transition hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-teal-200"
                        >
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
