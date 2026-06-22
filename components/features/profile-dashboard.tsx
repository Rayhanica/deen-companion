"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bell, Bookmark, CheckCircle2, Cloud, LogOut, Minus, Plus, Settings, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress";
import { CALCULATION_METHODS } from "@/lib/constants";
import { percentage, todayKey } from "@/lib/utils";
import { useUserState } from "@/lib/user-state";

export function ProfileDashboard() {
  const {
    state,
    session,
    cloudSync,
    signIn,
    signUp,
    signOut,
    updatePreferences,
    updateState
  } = useUserState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authMessage, setAuthMessage] = useState("");
  const todayCompleted = state.completedDeeds[todayKey()] ?? [];

  const totals = useMemo(
    () => [
      { label: "Ayah bookmarks", value: state.ayahBookmarks.length },
      { label: "Favorite ayahs", value: state.ayahFavorites.length },
      { label: "Memorized ayahs", value: state.memorizedAyahs.length },
      { label: "Dua favorites", value: state.duaFavorites.length },
      { label: "Hadith bookmarks", value: state.hadithBookmarks.length },
      { label: "Fasting days", value: state.fastingDays.length }
    ],
    [state]
  );

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    const result = authMode === "signin" ? await signIn(email, password) : await signUp(email, password);
    if (result.error) setAuthMessage(result.error);
    else setAuthMessage(authMode === "signin" ? "Signed in." : "Check your email if confirmation is enabled.");
  }

  function updateGoal(id: string, field: "target" | "current", delta: number) {
    updateState((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id === id ? { ...goal, [field]: Math.max(0, goal[field] + delta) } : goal
      )
    }));
  }

  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    updatePreferences({ notifications: permission === "granted" });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Profile"
        title="Settings and progress"
        body="Use guest mode locally or sign in with Supabase to sync bookmarks, notes, preferences, goals, and progress."
      />

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{session ? "Signed in" : "Guest mode"}</CardTitle>
                <CardDescription>{session?.user.email ?? "Local saves stay in this browser."}</CardDescription>
              </div>
              <UserRound className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            {session ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-skysoft/55 p-3 dark:bg-white/8">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Cloud sync</span>
                  <Badge>{cloudSync}</Badge>
                </div>
                <Button variant="secondary" className="w-full" onClick={signOut}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button type="submit">{authMode === "signin" ? "Sign in" : "Sign up"}</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                  >
                    {authMode === "signin" ? "Create account" : "Use sign in"}
                  </Button>
                </div>
                {authMessage ? <p className="text-sm text-slate-600 dark:text-slate-300">{authMessage}</p> : null}
              </form>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Language, translation, method, school, notifications.</CardDescription>
              </div>
              <Settings className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-ink dark:text-white" htmlFor="language">
                Language
                <select
                  id="language"
                  value={state.preferences.language}
                  onChange={() => updatePreferences({ language: "en" })}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option value="en">English</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-ink dark:text-white" htmlFor="translation">
                Quran translation
                <select
                  id="translation"
                  value={state.preferences.translation}
                  onChange={(event) => updatePreferences({ translation: event.target.value })}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option value="en.sahih">Saheeh International</option>
                  <option value="en.pickthall">Pickthall</option>
                  <option value="en.yusufali">Yusuf Ali</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-ink dark:text-white" htmlFor="profile-method">
                Prayer method
                <select
                  id="profile-method"
                  value={state.preferences.calculationMethod}
                  onChange={(event) => updatePreferences({ calculationMethod: Number(event.target.value) })}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  {CALCULATION_METHODS.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-ink dark:text-white" htmlFor="profile-school">
                Asr school
                <select
                  id="profile-school"
                  value={state.preferences.school}
                  onChange={(event) => updatePreferences({ school: Number(event.target.value) as 0 | 1 })}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option value={0}>Shafi, Maliki, Hanbali</option>
                  <option value={1}>Hanafi</option>
                </select>
              </label>
              <Button variant={state.preferences.notifications ? "secondary" : "primary"} className="w-full" onClick={enableNotifications}>
                <Bell className="h-4 w-4" aria-hidden="true" />
                {state.preferences.notifications ? "Notifications enabled" : "Enable notifications"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {totals.map((item) => (
              <Card key={item.label}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="mt-1 text-3xl font-semibold text-ink dark:text-white">{item.value}</p>
                  </div>
                  <Bookmark className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Today’s dashboard</CardTitle>
                <CardDescription>Progress across daily deed checklist.</CardDescription>
              </div>
              <CheckCircle2 className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="rounded-lg bg-skysoft/55 p-4 dark:bg-white/8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink dark:text-white">Daily deeds complete</p>
                <p className="font-semibold text-reed dark:text-teal-200">{todayCompleted.length}/8</p>
              </div>
              <ProgressBar value={percentage(todayCompleted.length, 8)} className="mt-3" />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Goals</CardTitle>
                <CardDescription>Quran, salah, dhikr, and knowledge goals.</CardDescription>
              </div>
              <Cloud className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="space-y-3">
              {state.goals.map((goal) => {
                const value = percentage(goal.current, goal.target);
                return (
                  <div key={goal.id} className="rounded-lg border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-ink dark:text-white">{goal.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {goal.current} of {goal.target}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="secondary" size="icon" aria-label={`Decrease ${goal.title}`} onClick={() => updateGoal(goal.id, "current", -1)}>
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button size="icon" aria-label={`Increase ${goal.title}`} onClick={() => updateGoal(goal.id, "current", 1)}>
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateGoal(goal.id, "target", 1)}>
                          Target +
                        </Button>
                      </div>
                    </div>
                    <ProgressBar value={value} className="mt-3" />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
