"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookMarked, CalendarDays, CheckCircle2, ChevronRight, Clock3, Flame, MoonStar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/state";
import { getDailyItem, duasData, goalsData, hadithData } from "@/lib/content";
import { formatMinutes, percentage, todayKey } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import { useUserState } from "@/lib/user-state";
import type { PrayerTimings } from "@/lib/types";
import { formatPrayerClock, getNextPrayer } from "@/lib/prayer-utils";

const fallbackAyah = {
  arabic: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ",
  translation: "Our Lord, accept this from us. You are indeed the All-Hearing, All-Knowing.",
  reference: "Quran 2:127"
};

export function HomeDashboard() {
  const { state, toggleDeed, toggleFastingDay } = useUserState();
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [loadingPrayer, setLoadingPrayer] = useState(true);
  const today = todayKey();
  const completed = state.completedDeeds[today] ?? [];
  const dailyDua = getDailyItem(duasData);
  const dailyHadith = getDailyItem(hadithData);
  const nextPrayer = useMemo(() => getNextPrayer(timings), [timings]);
  const seconds = useCountdown(nextPrayer?.date);
  const deedProgress = percentage(completed.length, goalsData.length);

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
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden p-0">
          <div className="bg-reed px-5 py-6 text-white dark:bg-teal-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white/75">Today</p>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">Assalamu alaykum</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/82">
                  A focused space for Quran, salah, dhikr, learning, and steady daily progress.
                </p>
              </div>
              <MoonStar className="h-9 w-9 text-saffron" aria-hidden="true" />
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Daily deeds</p>
              <p className="mt-1 text-2xl font-semibold text-ink dark:text-white">{deedProgress}%</p>
              <ProgressBar value={deedProgress} className="mt-3" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Quran goal</p>
              <p className="mt-1 text-2xl font-semibold text-ink dark:text-white">
                {state.preferences.dailyQuranMinutes}m
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Daily target</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Streak signal</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-ink dark:text-white">
                <Flame className="h-6 w-6 text-clay" aria-hidden="true" />
                {completed.length}
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Actions today</p>
            </div>
          </div>
        </Card>

        {loadingPrayer ? (
          <LoadingState label="Loading prayer times" />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Next prayer</CardTitle>
                <CardDescription>{timings?.hijriDate ?? state.preferences.city}</CardDescription>
              </div>
              <Clock3 className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            {nextPrayer ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-end justify-between gap-3">
                    <p className="text-3xl font-bold text-ink dark:text-white">{nextPrayer.name}</p>
                    <p className="text-xl font-semibold text-reed dark:text-teal-200">
                      {formatPrayerClock(nextPrayer.time)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Begins in {formatMinutes(seconds)}
                  </p>
                </div>
                <Link href="/prayer">
                  <Button className="w-full">
                    Open prayer tools
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Set your city in Prayer or Profile.</p>
            )}
          </Card>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Daily ayah</CardTitle>
              <CardDescription>{fallbackAyah.reference}</CardDescription>
            </div>
            <BookMarked className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
          </CardHeader>
          <p className="arabic-text text-right text-2xl font-semibold text-ink dark:text-white">{fallbackAyah.arabic}</p>
          <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-200">{fallbackAyah.translation}</p>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Daily hadith</CardTitle>
              <CardDescription>{dailyHadith.reference}</CardDescription>
            </div>
            <Badge>{dailyHadith.category}</Badge>
          </CardHeader>
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{dailyHadith.text}</p>
          <Link href="/learn/hadith" className="mt-4 inline-flex text-sm font-medium text-reed dark:text-teal-200">
            Hadith library
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Daily dua</CardTitle>
              <CardDescription>{dailyDua.reference}</CardDescription>
            </div>
            <Badge>{dailyDua.category}</Badge>
          </CardHeader>
          <p className="arabic-text text-right text-xl font-semibold text-ink dark:text-white">{dailyDua.arabic}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{dailyDua.translation}</p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Today’s goals</CardTitle>
              <CardDescription>Track small deeds consistently.</CardDescription>
            </div>
            <CheckCircle2 className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
          </CardHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            {goalsData.map((goal) => {
              const checked = completed.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleDeed(goal.id)}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-black/5 bg-white/70 px-3 text-left text-sm transition hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <span className="font-medium text-ink dark:text-white">{goal.title}</span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      checked
                        ? "border-reed bg-reed text-white"
                        : "border-slate-300 text-transparent dark:border-slate-600"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Fasting tracker</CardTitle>
              <CardDescription>Useful for Ramadan, Mondays/Thursdays, and make-up fasts.</CardDescription>
            </div>
            <CalendarDays className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
          </CardHeader>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-skysoft/55 p-4 dark:bg-white/8">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Today marked as fasting</p>
              <p className="mt-1 text-2xl font-semibold text-ink dark:text-white">
                {state.fastingDays.includes(today) ? "Yes" : "No"}
              </p>
            </div>
            <Button variant={state.fastingDays.includes(today) ? "secondary" : "primary"} onClick={() => toggleFastingDay()}>
              {state.fastingDays.includes(today) ? "Unmark" : "Mark"}
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Total recorded fasts: <span className="font-semibold text-ink dark:text-white">{state.fastingDays.length}</span>
          </p>
        </Card>
      </section>
    </div>
  );
}
