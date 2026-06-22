"use client";

import { useMemo, useState } from "react";
import { Bell, Heart, Minus, Plus, RotateCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/state";
import { duasData, getDailyItem } from "@/lib/content";
import { cn, unique } from "@/lib/utils";
import { useUserState } from "@/lib/user-state";

export function DuaLibrary() {
  const {
    state,
    toggleDuaFavorite,
    incrementTasbih,
    resetTasbih,
    updatePreferences
  } = useUserState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...unique(duasData.map((dua) => dua.category))], []);
  const dailyDua = getDailyItem(duasData);

  const duas = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return duasData.filter((dua) => {
      const matchesCategory = category === "All" || dua.category === category;
      const haystack = [dua.title, dua.category, dua.translation, dua.transliteration, dua.reference].join(" ").toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [category, query]);

  async function enableDailyDuaNotification() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    updatePreferences({ notifications: permission === "granted" });
    if (permission === "granted") {
      new Notification("Daily dua enabled", {
        body: dailyDua.title
      });
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Duas and dhikr"
        title="Remember Allah throughout the day"
        body="Morning, evening, sleep, travel, stress, forgiveness, protection, Ramadan, and Hajj/Umrah duas with a tasbih counter."
        actions={
          <Button variant={state.preferences.notifications ? "secondary" : "primary"} onClick={enableDailyDuaNotification}>
            <Bell className="h-4 w-4" aria-hidden="true" />
            Daily dua
          </Button>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Daily dua</CardTitle>
                <CardDescription>{dailyDua.reference}</CardDescription>
              </div>
              <Badge>{dailyDua.category}</Badge>
            </CardHeader>
            <p className="arabic-text text-right text-2xl font-semibold text-ink dark:text-white">{dailyDua.arabic}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{dailyDua.translation}</p>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Tasbih</CardTitle>
                <CardDescription>Quick counters for dhikr goals.</CardDescription>
              </div>
              <RotateCcw className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            {["SubhanAllah", "Alhamdulillah", "Allahu Akbar", "Astaghfirullah", "Salawat"].map((item) => (
              <div key={item} className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-skysoft/55 p-3 dark:bg-white/8">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-white">{item}</p>
                  <p className="text-2xl font-semibold text-reed dark:text-teal-200">{state.tasbihCounts[item] ?? 0}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="secondary" size="icon" aria-label={`Decrease ${item}`} onClick={() => incrementTasbih(item, -1)}>
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button size="icon" aria-label={`Increase ${item}`} onClick={() => incrementTasbih(item)}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Reset ${item}`} onClick={() => resetTasbih(item)}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Find duas</CardTitle>
                <CardDescription>Search or filter by category.</CardDescription>
              </div>
              <Search className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="forgiveness, travel, stress"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
            <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-auto">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    category === item
                      ? "border-reed bg-reed text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-reed/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {duas.length ? (
            duas.map((dua) => {
              const favorite = state.duaFavorites.includes(dua.id);
              return (
                <Card key={dua.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge>{dua.category}</Badge>
                      <h2 className="mt-3 text-xl font-semibold text-ink dark:text-white">{dua.title}</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={favorite ? "Remove favorite dua" : "Favorite dua"}
                      onClick={() => toggleDuaFavorite(dua.id)}
                    >
                      <Heart className={cn("h-5 w-5", favorite && "fill-clay text-clay")} aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="arabic-text mt-4 text-right text-2xl font-semibold text-ink dark:text-white">{dua.arabic}</p>
                  <p className="mt-4 text-sm italic leading-7 text-slate-500 dark:text-slate-400">{dua.transliteration}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{dua.translation}</p>
                  <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">{dua.reference}</p>
                </Card>
              );
            })
          ) : (
            <EmptyState title="No duas found" body="Try another keyword or category." />
          )}
        </div>
      </section>
    </div>
  );
}
