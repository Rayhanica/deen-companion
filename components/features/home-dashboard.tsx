"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  Check,
  Clock3,
  Flame,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
  Target,
  UsersRound
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/state";
import { getDailyItem, duasData, goalsData, hadithData, learningPathsData, studyGuidesData } from "@/lib/content";
import { formatMinutes, percentage, todayKey } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import { useUserState } from "@/lib/user-state";
import type { PrayerName, PrayerTimings } from "@/lib/types";
import { formatPrayerClock, getNextPrayer } from "@/lib/prayer-utils";

const prayerNames: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const fallbackAyah = {
  arabic: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ",
  translation: "Our Lord, accept this from us. You are indeed the All-Hearing, All-Knowing.",
  reference: "Quran 2:127"
};

function dateKey(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export function HomeDashboard() {
  const { state, toggleDeed } = useUserState();
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [loadingPrayer, setLoadingPrayer] = useState(true);
  const today = todayKey();
  const completed = state.completedDeeds[today] ?? [];
  const dailyDua = getDailyItem(duasData);
  const dailyHadith = getDailyItem(hadithData);
  const nextPrayer = useMemo(() => getNextPrayer(timings), [timings]);
  const seconds = useCountdown(nextPrayer?.date);
  const dailyChallenge = goalsData[new Date().getDate() % goalsData.length];
  const challengeDone = completed.includes(dailyChallenge.id);
  const enrolledPath = learningPathsData.find((path) => (state.enrolledPaths ?? []).includes(path.id));
  const recommendedPath =
    learningPathsData.find((path) =>
      state.preferences.journeyStage === "new-muslim"
        ? path.id === "new-muslim-12-weeks"
        : state.preferences.interests?.some((interest) => path.title.toLowerCase().includes(interest.toLowerCase()))
    ) ?? learningPathsData[0];
  const recommendedArticle = studyGuidesData[new Date().getDay() % studyGuidesData.length];
  const nextMemorization = state.memorizedAyahs.at(-1) ?? "112:1";
  const weeklyCompleted = Array.from({ length: 7 }, (_, index) => state.completedDeeds[dateKey(index)]?.length ?? 0);
  const weeklyTotal = weeklyCompleted.reduce((sum, value) => sum + value, 0);
  const weeklyProgress = percentage(weeklyTotal, goalsData.length * 7);
  const streak = useMemo(() => {
    let count = 0;
    for (let index = 0; index < 365; index += 1) {
      if ((state.completedDeeds[dateKey(index)]?.length ?? 0) === 0) break;
      count += 1;
    }
    return count;
  }, [state.completedDeeds]);

  useEffect(() => {
    const params = new URLSearchParams({
      city: state.preferences.city,
      country: state.preferences.country,
      method: String(state.preferences.calculationMethod),
      school: String(state.preferences.school)
    });
    setLoadingPrayer(true);
    fetch(`/api/prayer/timings?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Prayer request failed"))))
      .then((data: PrayerTimings) => setTimings(data))
      .catch(() => setTimings(null))
      .finally(() => setLoadingPrayer(false));
  }, [
    state.preferences.calculationMethod,
    state.preferences.city,
    state.preferences.country,
    state.preferences.school
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-reed dark:text-teal-200">Assalamu alaykum</p>
          <h1 className="mt-1 text-2xl font-bold text-ink dark:text-white md:text-3xl">Your day with Deen</h1>
        </div>
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {state.preferences.city}, {state.preferences.country}
        </p>
      </header>

      {loadingPrayer ? (
        <LoadingState label="Loading prayer times" />
      ) : timings && nextPrayer ? (
        <section className="overflow-hidden rounded-lg border border-reed/15 bg-reed text-white shadow-soft dark:border-white/10 dark:bg-[#23473d]">
          <div className="grid gap-5 px-5 py-5 lg:grid-cols-[0.65fr_1.35fr] lg:px-7">
            <div>
              <p className="text-sm font-medium text-white/70">Next prayer</p>
              <div className="mt-2 flex items-end gap-3">
                <h2 className="text-4xl font-bold">{nextPrayer.name}</h2>
                <p className="pb-1 text-xl font-semibold text-white/80">{formatPrayerClock(nextPrayer.time)}</p>
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-white/75">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                In {formatMinutes(seconds)} · {timings.hijriDate}
              </p>
            </div>
            <div className="grid grid-cols-5 gap-1 rounded-lg bg-white/8 p-2 sm:gap-2">
              {prayerNames.map((name) => {
                const active = nextPrayer.name === name;
                return (
                  <div
                    key={name}
                    className={`flex min-w-0 flex-col items-center justify-center rounded-md px-1 py-3 text-center ${
                      active ? "bg-white text-reed" : "text-white"
                    }`}
                  >
                    <span className={`text-[11px] font-medium sm:text-xs ${active ? "text-reed" : "text-white/65"}`}>{name}</span>
                    <span className="mt-1 text-xs font-semibold sm:text-sm">{formatPrayerClock(timings[name])}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <Link href="/prayer" className="flex min-h-11 items-center justify-between border-t border-white/10 px-5 text-sm font-medium hover:bg-white/8 lg:px-7">
            Prayer calendar, qibla, reminders, and travel settings
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <Card>
          <h2 className="font-semibold text-ink dark:text-white">Prayer times need a location</h2>
          <Link href="/prayer" className="mt-3 inline-flex text-sm font-medium text-reed dark:text-teal-200">Set prayer location</Link>
        </Card>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Flame} value={String(streak)} label="Day streak" />
        <Metric icon={CalendarCheck2} value={`${weeklyProgress}%`} label="Weekly progress" />
        <Metric icon={Target} value={`${completed.length}/${goalsData.length}`} label="Today’s deeds" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-reed dark:text-teal-200">Daily ayah</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{fallbackAyah.reference}</p>
            </div>
            <Link href="/quran" className="text-sm font-medium text-reed dark:text-teal-200">Study ayah</Link>
          </div>
          <p className="arabic-text mt-4 text-right text-3xl font-semibold text-ink dark:text-white">{fallbackAyah.arabic}</p>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{fallbackAyah.translation}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-saffron">Daily challenge</p>
              <h2 className="mt-2 text-lg font-semibold text-ink dark:text-white">{dailyChallenge.title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Complete one focused action today.</p>
            </div>
            <button
              type="button"
              onClick={() => toggleDeed(dailyChallenge.id)}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                challengeDone ? "border-reed bg-reed text-white" : "border-slate-300 text-slate-400 dark:border-slate-600"
              }`}
              aria-label={challengeDone ? "Mark challenge incomplete" : "Complete challenge"}
            >
              <Check className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink dark:text-white">Continue</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <ContinueCard
            icon={GraduationCap}
            eyebrow="Learning"
            title={enrolledPath?.title ?? recommendedPath.title}
            detail={enrolledPath ? "Continue your enrolled path" : "Recommended starting path"}
            href={`/learn/paths?path=${enrolledPath?.id ?? recommendedPath.id}`}
          />
          <ContinueCard
            icon={BookOpen}
            eyebrow="Memorization"
            title={`Review ayah ${nextMemorization}`}
            detail={`${state.memorizedAyahs.length} ayahs marked memorized`}
            href="/quran"
          />
          <ContinueCard
            icon={UsersRound}
            eyebrow="Community"
            title="Find a class or study circle"
            detail="Local and online learning opportunities"
            href="/community"
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink dark:text-white">Recent searches</h2>
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(state.recentSearches ?? []).length ? (
              (state.recentSearches ?? []).slice(0, 6).map((search) => (
                <Link
                  key={search}
                  href={`/learn?mode=sources&query=${encodeURIComponent(search)}`}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300"
                >
                  {search}
                </Link>
              ))
            ) : (
              <p className="text-sm leading-6 text-slate-500">Your global searches will appear here for quick return.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-reed dark:text-teal-200">Recommended for you</p>
              <h2 className="mt-2 text-lg font-semibold text-ink dark:text-white">{recommendedArticle.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{recommendedArticle.overview}</p>
            </div>
            <Sparkles className="h-6 w-6 shrink-0 text-saffron" aria-hidden="true" />
          </div>
          <Link
            href={`/learn?mode=knowledge&resource=${recommendedArticle.id}#${recommendedArticle.id}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-reed dark:text-teal-200"
          >
            Read recommendation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <DailyText title={`Daily hadith · ${dailyHadith.reference}`} body={dailyHadith.text} href="/learn/hadith" />
        <DailyText title={`Daily dua · ${dailyDua.reference}`} body={dailyDua.translation} href="/duas" />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, value, label }: { icon: typeof Flame; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.045]">
      <Icon className="h-5 w-5 text-reed dark:text-teal-200" aria-hidden="true" />
      <span>
        <span className="block text-xl font-bold text-ink dark:text-white">{value}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{label}</span>
      </span>
    </div>
  );
}

function ContinueCard({
  icon: Icon,
  eyebrow,
  title,
  detail,
  href
}: {
  icon: typeof BookOpen;
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <Link href={href} className="group flex min-h-28 gap-4 rounded-lg border border-slate-200/80 bg-white p-4 transition hover:border-reed/35 dark:border-white/10 dark:bg-white/[0.045]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-reed/10 text-reed dark:text-teal-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="text-xs font-semibold uppercase text-slate-400">{eyebrow}</span>
        <span className="mt-1 block font-semibold text-ink group-hover:text-reed dark:text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</span>
      </span>
    </Link>
  );
}

function DailyText({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-slate-200/80 bg-white px-5 py-4 transition hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.035]">
      <p className="text-xs font-semibold uppercase text-slate-400">{title}</p>
      <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{body}</p>
    </Link>
  );
}
