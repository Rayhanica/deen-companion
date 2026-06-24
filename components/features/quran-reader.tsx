"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  BookOpenText,
  CheckCircle2,
  ExternalLink,
  Heart,
  Lightbulb,
  ListMusic,
  Pause,
  Play,
  RotateCcw,
  Save,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress";
import { ReferenceLinks } from "@/components/ui/reference-links";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { tajweedData } from "@/lib/content";
import type { QuranPassage, QuranTafsir } from "@/lib/types";
import { cn, percentage } from "@/lib/utils";
import { useUserState } from "@/lib/user-state";

type SurahMeta = {
  number: number;
  englishName: string;
  name: string;
  numberOfAyahs: number;
  revelationType: string;
};

const fallbackSurahs: SurahMeta[] = [
  { number: 1, englishName: "Al-Fatihah", name: "الفاتحة", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, englishName: "Al-Baqarah", name: "البقرة", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 18, englishName: "Al-Kahf", name: "الكهف", numberOfAyahs: 110, revelationType: "Meccan" },
  { number: 36, englishName: "Ya-Sin", name: "يس", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 67, englishName: "Al-Mulk", name: "الملك", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 112, englishName: "Al-Ikhlas", name: "الإخلاص", numberOfAyahs: 4, revelationType: "Meccan" }
];

export function QuranReader() {
  const {
    state,
    toggleAyahBookmark,
    toggleAyahFavorite,
    toggleMemorizedAyah,
    setAyahNote,
    updatePreferences
  } = useUserState();
  const [mode, setMode] = useState<"surah" | "juz">("surah");
  const [selectedId, setSelectedId] = useState(1);
  const [surahs, setSurahs] = useState<SurahMeta[]>(fallbackSurahs);
  const [passage, setPassage] = useState<QuranPassage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeAudioKey, setActiveAudioKey] = useState("");
  const [repeatCount, setRepeatCount] = useState(3);
  const [tafsirByKey, setTafsirByKey] = useState<Record<string, QuranTafsir>>({});
  const [expandedTafsir, setExpandedTafsir] = useState<Record<string, boolean>>({});
  const [loadingTafsirKey, setLoadingTafsirKey] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const remainingRepeats = useRef(0);

  useEffect(() => {
    fetch("/api/quran/surahs")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Surah list failed"))))
      .then((data: SurahMeta[]) => setSurahs(data))
      .catch(() => setSurahs(fallbackSurahs));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setPassage(null);

    fetch(`/api/quran/${mode}/${selectedId}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Quran passage failed"))))
      .then((data: QuranPassage) => {
        if (!cancelled) setPassage(data);
      })
      .catch(() => {
        if (!cancelled) setError("The Quran service is unavailable right now. Saved content and lessons still work.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, selectedId]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const filteredAyahs = useMemo(() => {
    if (!passage) return [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return passage.ayahs;
    return passage.ayahs.filter((ayah) =>
      [ayah.arabic, ayah.translation, ayah.transliteration, `${ayah.surahEnglishName} ${ayah.numberInSurah}`]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [passage, query]);

  const memorizedInPassage = useMemo(() => {
    if (!passage) return 0;
    return passage.ayahs.filter((ayah) => state.memorizedAyahs.includes(ayahKey(ayah.surahNumber, ayah.numberInSurah))).length;
  }, [passage, state.memorizedAyahs]);

  function ayahKey(surah: number, ayah: number) {
    return `${surah}:${ayah}`;
  }

  function quranComUrl(key: string) {
    const [surah, ayah] = key.split(":");
    return `https://quran.com/${surah}?startingVerse=${ayah}`;
  }

  function playAyah(audioUrl: string | undefined, key: string, repeats = 1) {
    if (!audioUrl) return;
    if (audioRef.current && activeAudioKey === key && !audioRef.current.paused) {
      audioRef.current.pause();
      setActiveAudioKey("");
      return;
    }

    audioRef.current?.pause();
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    remainingRepeats.current = Math.max(1, repeats);
    setActiveAudioKey(key);

    audio.onended = () => {
      remainingRepeats.current -= 1;
      if (remainingRepeats.current > 0) {
        audio.currentTime = 0;
        void audio.play();
      } else {
        setActiveAudioKey("");
      }
    };

    audio.onerror = () => setActiveAudioKey("");
    void audio.play();
  }

  async function toggleTafsir(key: string) {
    const willOpen = !expandedTafsir[key];
    setExpandedTafsir((current) => ({ ...current, [key]: willOpen }));
    if (!willOpen || tafsirByKey[key]) return;

    setLoadingTafsirKey(key);
    try {
      const response = await fetch(`/api/quran/tafsir?ayahKey=${encodeURIComponent(key)}`);
      if (!response.ok) throw new Error("Tafsir request failed");
      const tafsir = (await response.json()) as QuranTafsir;
      setTafsirByKey((current) => ({ ...current, [key]: tafsir }));
    } catch {
      setTafsirByKey((current) => ({
        ...current,
        [key]: {
          ayahKey: key,
          source: "Deen Companion contextual study guide",
          text: "Read this ayah with the surrounding passage and identify its central teaching. A recognized tafsir should be consulted for transmitted explanations, legal details, and points where translations differ.",
          context: "The external tafsir source could not be reached. This study framework remains available offline.",
          themes: ["Read in context", "Connect meaning with action", "Ask qualified teachers"],
          application: "Record one question and one responsible action connected to the ayah.",
          reflection: [
            "Read the ayah with the ayah before and after it.",
            "Identify what the ayah teaches about Allah, worship, character, or the Hereafter.",
            "Avoid deriving rulings from a translation alone."
          ],
          references: ["For personal learning. Ask a qualified scholar for specific rulings."],
          sourceUrl: quranComUrl(key),
          kind: "study-guide"
        }
      }));
    } finally {
      setLoadingTafsirKey("");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Quran learning"
        title="Read, listen, memorize, understand"
        body="Arabic text, English translation, transliteration, recitation audio, tafsir, study reflections, notes, bookmarks, hifz tracking, and beginner tajweed."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-black/5 bg-white/80 p-1 dark:border-white/10 dark:bg-white/10">
            {(["surah", "juz"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setSelectedId(1);
                }}
                className={cn(
                  "h-9 rounded-md px-3 text-sm font-medium transition",
                  mode === item
                    ? "bg-reed text-white"
                    : "text-slate-600 hover:bg-reed/10 dark:text-slate-300 dark:hover:bg-white/10"
                )}
              >
                {item === "surah" ? "Surah" : "Juz"}
              </button>
            ))}
          </div>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Navigation</CardTitle>
                <CardDescription>{mode === "surah" ? "All 114 surahs from the API." : "30 juz sections."}</CardDescription>
              </div>
              <BookOpen className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>

            {mode === "surah" ? (
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(Number(event.target.value))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                {surahs.map((surah) => (
                  <option key={surah.number} value={surah.number}>
                    {surah.number}. {surah.englishName} ({surah.numberOfAyahs})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(Number(event.target.value))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                {Array.from({ length: 30 }, (_, index) => index + 1).map((juz) => (
                  <option key={juz} value={juz}>
                    Juz {juz}
                  </option>
                ))}
              </select>
            )}

            <label className="mt-4 block text-sm font-medium text-ink dark:text-white" htmlFor="quran-goal">
              Daily Quran goal: {state.preferences.dailyQuranMinutes} minutes
            </label>
            <input
              id="quran-goal"
              type="range"
              min="5"
              max="120"
              step="5"
              value={state.preferences.dailyQuranMinutes}
              onChange={(event) => updatePreferences({ dailyQuranMinutes: Number(event.target.value) })}
              className="mt-3 w-full accent-reed"
            />

            {passage ? (
              <div className="mt-5 rounded-lg bg-skysoft/55 p-4 dark:bg-white/8">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink dark:text-white">Memorized here</span>
                  <span className="font-semibold text-reed dark:text-teal-200">
                    {percentage(memorizedInPassage, passage.ayahs.length)}%
                  </span>
                </div>
                <ProgressBar value={percentage(memorizedInPassage, passage.ayahs.length)} className="mt-3" />
              </div>
            ) : null}

            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-white/10 xl:hidden">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink dark:text-white">Ayah repeat</span>
                <div className="flex gap-1">
                  {[1, 3, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setRepeatCount(count)}
                      className={cn(
                        "h-8 min-w-10 rounded-md border px-2 text-xs font-medium",
                        repeatCount === count
                          ? "border-reed bg-reed text-white"
                          : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"
                      )}
                    >
                      {count}x
                    </button>
                  ))}
                </div>
              </div>
              <Link href="/learn" className="mt-4 inline-flex text-sm font-medium text-reed dark:text-teal-200">
                Open Arabic and tajweed curriculum
              </Link>
            </div>
          </Card>

          <Card className="hidden xl:block">
            <CardHeader>
              <div>
                <CardTitle>Repeat audio</CardTitle>
                <CardDescription>Set ayah repeat count for hifz practice.</CardDescription>
              </div>
              <RotateCcw className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setRepeatCount(count)}
                  className={cn(
                    "h-10 rounded-lg border text-sm font-medium transition",
                    repeatCount === count
                      ? "border-reed bg-reed text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-reed/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  )}
                >
                  {count}x
                </button>
              ))}
            </div>
          </Card>

          <Card className="hidden xl:block">
            <CardHeader>
              <div>
                <CardTitle>Tajweed starter</CardTitle>
                <CardDescription>Short beginner lessons with practice prompts.</CardDescription>
              </div>
              <ListMusic className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="space-y-3">
              {tajweedData.slice(0, 4).map((lesson) => (
                <div key={lesson.id} className="rounded-lg border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-ink dark:text-white">{lesson.title}</p>
                    <Badge>{lesson.level}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{lesson.summary}</p>
                  <p className="mt-2 text-xs font-medium text-reed dark:text-teal-200">{lesson.practice}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink dark:text-white">{passage?.name ?? "Quran"}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{passage?.subtitle ?? "Loading passage"}</p>
              </div>
              <label className="relative block min-w-0 sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search this passage"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
              </label>
            </div>
          </Card>

          {loading ? <LoadingState label="Loading Quran passage" /> : null}
          {error ? <EmptyState title="Quran API unavailable" body={error} /> : null}

          {!loading && !error && passage ? (
            filteredAyahs.length ? (
              <div className="space-y-3">
                {filteredAyahs.map((ayah) => {
                  const key = ayahKey(ayah.surahNumber, ayah.numberInSurah);
                  const bookmarked = state.ayahBookmarks.includes(key);
                  const favorite = state.ayahFavorites.includes(key);
                  const memorized = state.memorizedAyahs.includes(key);
                  const active = activeAudioKey === key;

                  return (
                    <Card key={key} className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge>
                            {ayah.surahEnglishName} {ayah.numberInSurah}
                          </Badge>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Juz {ayah.juz}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={bookmarked ? "Remove bookmark" : "Bookmark ayah"}
                            onClick={() => toggleAyahBookmark(key)}
                          >
                            <Bookmark
                              className={cn("h-5 w-5", bookmarked && "fill-reed text-reed dark:fill-teal-200 dark:text-teal-200")}
                              aria-hidden="true"
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={favorite ? "Remove favorite" : "Favorite ayah"}
                            onClick={() => toggleAyahFavorite(key)}
                          >
                            <Heart
                              className={cn("h-5 w-5", favorite && "fill-clay text-clay")}
                              aria-hidden="true"
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={memorized ? "Mark not memorized" : "Mark memorized"}
                            onClick={() => toggleMemorizedAyah(key)}
                          >
                            <CheckCircle2
                              className={cn("h-5 w-5", memorized && "fill-reed text-white dark:fill-teal-300 dark:text-slate-950")}
                              aria-hidden="true"
                            />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            aria-label={active ? "Pause recitation" : "Play recitation"}
                            onClick={() => playAyah(ayah.audio, key, repeatCount)}
                            disabled={!ayah.audio}
                          >
                            {active ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
                          </Button>
                        </div>
                      </div>

                      <p className="arabic-text text-right text-3xl font-semibold text-ink dark:text-white">{ayah.arabic}</p>
                      <div className="space-y-2">
                        <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{ayah.translation}</p>
                        {ayah.transliteration ? (
                          <p className="text-sm italic leading-7 text-slate-500 dark:text-slate-400">{ayah.transliteration}</p>
                        ) : null}
                      </div>

                      <div className="rounded-lg border border-reed/15 bg-[#f3f7f4] p-4 dark:border-teal-200/15 dark:bg-white/[0.045]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
                              <BookOpenText className="h-4 w-4 text-reed dark:text-teal-200" aria-hidden="true" />
                              Tafsir and deeper explanation
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Classical tafsir when configured, with a sourced contextual guide for every ayah.
                            </p>
                          </div>
                          <Button variant="secondary" size="sm" onClick={() => toggleTafsir(key)}>
                            {expandedTafsir[key] ? "Hide" : "Open"}
                          </Button>
                        </div>

                        {expandedTafsir[key] ? (
                          <div className="mt-4 space-y-4">
                            {loadingTafsirKey === key ? (
                              <p className="text-sm text-slate-600 dark:text-slate-300">Loading tafsir...</p>
                            ) : tafsirByKey[key] ? (
                              <div className="space-y-4">
                                <div>
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-semibold text-ink dark:text-white">{tafsirByKey[key].source}</p>
                                      <Badge>
                                        {tafsirByKey[key].kind === "classical-tafsir" ? "Classical tafsir" : "Study guide"}
                                      </Badge>
                                    </div>
                                    {tafsirByKey[key].sourceUrl ? (
                                      <a
                                        href={tafsirByKey[key].sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-reed hover:underline dark:text-teal-200"
                                      >
                                        Read source
                                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                      </a>
                                    ) : null}
                                  </div>
                                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">
                                    {tafsirByKey[key].text}
                                  </p>
                                </div>

                                {tafsirByKey[key].context ? (
                                  <div className="border-l-2 border-reed/30 pl-4">
                                    <p className="text-xs font-semibold uppercase text-reed dark:text-teal-200">Surah context</p>
                                    <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">
                                      {tafsirByKey[key].context}
                                    </p>
                                  </div>
                                ) : null}

                                <div className="grid gap-3 lg:grid-cols-2">
                                  {tafsirByKey[key].themes?.length ? (
                                    <div className="rounded-lg bg-white p-4 dark:bg-slate-950/50">
                                      <p className="text-sm font-semibold text-ink dark:text-white">Themes in this passage</p>
                                      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                                        {tafsirByKey[key].themes?.map((item) => (
                                          <li key={item} className="flex gap-2">
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-reed dark:bg-teal-200" />
                                            {item}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : null}
                                  <div className="rounded-lg bg-white p-4 dark:bg-slate-950/50">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
                                      <Lightbulb className="h-4 w-4 text-saffron" aria-hidden="true" />
                                      Practice and reflection
                                    </p>
                                    {tafsirByKey[key].application ? (
                                      <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                                        {tafsirByKey[key].application}
                                      </p>
                                    ) : null}
                                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                      {tafsirByKey[key].reflection.map((item) => (
                                        <li key={item}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                <ReferenceLinks references={tafsirByKey[key].references} className="sm:grid-cols-2" compact />
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-lg border border-black/5 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink dark:text-white" htmlFor={`note-${key}`}>
                          <Save className="h-4 w-4" aria-hidden="true" />
                          Notes
                        </label>
                        <textarea
                          id={`note-${key}`}
                          value={state.ayahNotes[key] ?? ""}
                          onChange={(event) => setAyahNote(key, event.target.value)}
                          rows={2}
                          placeholder="Reflection, vocabulary, memorization cue"
                          className="min-h-20 w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No ayahs found" body="Try a different search within this passage." />
            )
          ) : null}
        </div>
      </section>
    </div>
  );
}
