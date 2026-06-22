"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Compass, LocateFixed, MapPin, Search, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { CALCULATION_METHODS, PRAYER_NAMES } from "@/lib/constants";
import { formatMinutes, parseCityCountry } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import { formatPrayerClock, getNextPrayer } from "@/lib/prayer-utils";
import type { PrayerTimings } from "@/lib/types";
import { useUserState } from "@/lib/user-state";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export function PrayerPanel() {
  const { state, updatePreferences } = useUserState();
  const [search, setSearch] = useState(`${state.preferences.city}, ${state.preferences.country}`);
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [calendar, setCalendar] = useState<PrayerTimings[]>([]);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [qibla, setQibla] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const notifiedKey = useRef("");
  const nextPrayer = useMemo(() => getNextPrayer(timings), [timings]);
  const seconds = useCountdown(nextPrayer?.date);

  useEffect(() => {
    const params = new URLSearchParams({
      city: state.preferences.city,
      country: state.preferences.country,
      method: String(state.preferences.calculationMethod),
      school: String(state.preferences.school)
    });

    if (coordinates) {
      params.set("latitude", String(coordinates.latitude));
      params.set("longitude", String(coordinates.longitude));
    }

    setLoading(true);
    setError("");

    fetch(`/api/prayer/timings?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Prayer request failed"))))
      .then((data: PrayerTimings) => setTimings(data))
      .catch(() => {
        setTimings(null);
        setError("Unable to load prayer times. Check the city/country spelling or try location access.");
      })
      .finally(() => setLoading(false));
  }, [
    coordinates,
    state.preferences.calculationMethod,
    state.preferences.city,
    state.preferences.country,
    state.preferences.school
  ]);

  useEffect(() => {
    const date = new Date();
    const params = new URLSearchParams({
      city: state.preferences.city,
      country: state.preferences.country,
      method: String(state.preferences.calculationMethod),
      school: String(state.preferences.school),
      month: String(date.getMonth() + 1),
      year: String(date.getFullYear())
    });

    fetch(`/api/prayer/calendar?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Calendar failed"))))
      .then((data: PrayerTimings[]) => setCalendar(data))
      .catch(() => setCalendar([]));
  }, [
    state.preferences.calculationMethod,
    state.preferences.city,
    state.preferences.country,
    state.preferences.school
  ]);

  useEffect(() => {
    if (!coordinates) {
      setQibla(null);
      return;
    }

    const params = new URLSearchParams({
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude)
    });

    fetch(`/api/prayer/qibla?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Qibla failed"))))
      .then((data: { direction: number }) => setQibla(data.direction))
      .catch(() => setQibla(null));
  }, [coordinates]);

  useEffect(() => {
    if (!state.preferences.notifications || !nextPrayer || seconds > 20 || seconds <= 0) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const key = `${nextPrayer.name}-${nextPrayer.date.toISOString()}`;
    if (notifiedKey.current === key) return;
    notifiedKey.current = key;
    new Notification(`${nextPrayer.name} is almost here`, {
      body: `Prayer time begins at ${formatPrayerClock(nextPrayer.time)}.`
    });
  }, [nextPrayer, seconds, state.preferences.notifications]);

  function applyCitySearch() {
    const parsed = parseCityCountry(search);
    setCoordinates(null);
    updatePreferences(parsed);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setError("");
      },
      () => setError("Location permission was denied. You can still search by city.")
    );
  }

  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    updatePreferences({ notifications: permission === "granted" });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Prayer times"
        title="Salah, qibla, reminders"
        body="Location-based timings, manual city search, calculation settings, qibla direction, and a monthly prayer calendar."
      />

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Location</CardTitle>
                <CardDescription>{coordinates ? "Using device coordinates." : "Search by city and country."}</CardDescription>
              </div>
              <MapPin className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyCitySearch();
                }}
                placeholder="New York, United States"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button onClick={applyCitySearch}>Search</Button>
              <Button variant="secondary" onClick={useCurrentLocation}>
                <LocateFixed className="h-4 w-4" aria-hidden="true" />
                Use location
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Calculation method and Asr school.</CardDescription>
              </div>
              <Settings2 className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <label className="block text-sm font-medium text-ink dark:text-white" htmlFor="method">
              Calculation method
            </label>
            <select
              id="method"
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
            <label className="mt-4 block text-sm font-medium text-ink dark:text-white" htmlFor="school">
              Asr calculation
            </label>
            <select
              id="school"
              value={state.preferences.school}
              onChange={(event) => updatePreferences({ school: Number(event.target.value) as 0 | 1 })}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              <option value={0}>Shafi, Maliki, Hanbali</option>
              <option value={1}>Hanafi</option>
            </select>
            <Button className="mt-4 w-full" variant={state.preferences.notifications ? "secondary" : "primary"} onClick={enableNotifications}>
              {state.preferences.notifications ? "Notifications enabled" : "Enable reminders"}
            </Button>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Qibla</CardTitle>
                <CardDescription>{qibla === null ? "Use location to calculate." : "Degrees clockwise from north."}</CardDescription>
              </div>
              <Compass className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="flex items-center justify-center py-4">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-reed/20 bg-skysoft/55 dark:border-teal-200/20 dark:bg-white/8">
                <div className="absolute top-3 text-xs font-semibold text-reed dark:text-teal-200">N</div>
                <Compass
                  className="h-20 w-20 text-reed transition-transform dark:text-teal-200"
                  style={{ transform: `rotate(${qibla ?? 0}deg)` }}
                  aria-hidden="true"
                />
              </div>
            </div>
            <p className="text-center text-2xl font-bold text-ink dark:text-white">{qibla === null ? "Not set" : `${qibla}°`}</p>
          </Card>
        </div>

        <div className="space-y-4">
          {loading ? <LoadingState label="Loading prayer times" /> : null}
          {error ? <EmptyState title="Prayer data issue" body={error} /> : null}

          {!loading && !error && timings ? (
            <>
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Today</CardTitle>
                    <CardDescription>
                      {timings.dateReadable} · {timings.hijriDate} · {timings.source}
                    </CardDescription>
                  </div>
                  <Badge>{state.preferences.city}</Badge>
                </CardHeader>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {PRAYER_NAMES.map((name) => {
                    const active = nextPrayer?.name === name;
                    return (
                      <div
                        key={name}
                        className={`rounded-lg border p-4 ${
                          active
                            ? "border-reed bg-reed text-white"
                            : "border-black/5 bg-white/70 dark:border-white/10 dark:bg-white/[0.04]"
                        }`}
                      >
                        <p className={`text-sm ${active ? "text-white/75" : "text-slate-500 dark:text-slate-400"}`}>{name}</p>
                        <p className="mt-2 text-2xl font-semibold">{formatPrayerClock(timings[name])}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Countdown</CardTitle>
                    <CardDescription>Next prayer begins soon.</CardDescription>
                  </div>
                  <Badge>{nextPrayer?.name}</Badge>
                </CardHeader>
                <div className="flex flex-col gap-3 rounded-lg bg-skysoft/55 p-5 dark:bg-white/8 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Time remaining</p>
                    <p className="mt-1 text-4xl font-bold text-ink dark:text-white">{formatMinutes(seconds)}</p>
                  </div>
                  <p className="text-lg font-semibold text-reed dark:text-teal-200">
                    {nextPrayer ? formatPrayerClock(nextPrayer.time) : ""}
                  </p>
                </div>
              </Card>
            </>
          ) : null}

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Monthly calendar</CardTitle>
                <CardDescription>Current month prayer timetable.</CardDescription>
              </div>
              <CalendarDays className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            {calendar.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-2 pr-3">Date</th>
                      {PRAYER_NAMES.map((name) => (
                        <th key={name} className="px-3 py-2">
                          {name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/10">
                    {calendar.slice(0, 31).map((day, index) => (
                      <tr key={`${day.dateReadable}-${index}`}>
                        <td className="py-3 pr-3 font-medium text-ink dark:text-white">{day.dateReadable}</td>
                        {PRAYER_NAMES.map((name) => (
                          <td key={name} className="px-3 py-3 text-slate-600 dark:text-slate-300">
                            {formatPrayerClock(day[name])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Calendar loads after a valid city is selected.</p>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
