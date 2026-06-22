"use client";

import { useState } from "react";
import { Landmark, LocateFixed, MapPin, Search, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, LoadingState } from "@/components/ui/state";
import type { PlaceResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUserState } from "@/lib/user-state";

type PlaceResponse = {
  origin: {
    latitude: number;
    longitude: number;
    label: string;
  };
  attribution: string;
  results: PlaceResult[];
  error?: string;
};

export function PlaceFinder() {
  const { state } = useUserState();
  const [type, setType] = useState<"masjid" | "halal">("masjid");
  const [location, setLocation] = useState(`${state.preferences.city}, ${state.preferences.country}`);
  const [radiusKm, setRadiusKm] = useState(8);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PlaceResponse | null>(null);
  const [error, setError] = useState("");

  async function search(params?: { latitude: number; longitude: number }) {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const query = new URLSearchParams({
        type,
        radiusKm: String(radiusKm)
      });
      if (params) {
        query.set("latitude", String(params.latitude));
        query.set("longitude", String(params.longitude));
      } else {
        query.set("location", location);
      }
      const response = await fetch(`/api/places/search?${query.toString()}`);
      const payload = (await response.json()) as PlaceResponse;
      if (!response.ok || payload.error) throw new Error(payload.error ?? "Search failed");
      setData(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to search nearby places.");
    } finally {
      setLoading(false);
    }
  }

  function useLocation() {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void search({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => setError("Location permission was denied. You can still search by city.")
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Find nearby"
        title="Masjids and halal food"
        body="Search by city or current location. Results use OpenStreetMap data, so always verify prayer facilities, hours, and halal status directly."
      />

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Search settings</CardTitle>
                <CardDescription>Choose what to find and where to search.</CardDescription>
              </div>
              <MapPin className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
            </CardHeader>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "masjid" as const, label: "Masjids", icon: Landmark },
                { id: "halal" as const, label: "Halal food", icon: Utensils }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={cn(
                      "flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition",
                      type === item.id
                        ? "border-reed bg-reed text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-reed/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <label className="mt-4 block text-sm font-medium text-ink dark:text-white">
              City or address
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void search();
                }}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
                placeholder="New York, United States"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-ink dark:text-white">
              Radius: {radiusKm} km
              <input
                type="range"
                min="1"
                max="50"
                value={radiusKm}
                onChange={(event) => setRadiusKm(Number(event.target.value))}
                className="mt-3 w-full accent-reed"
              />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button onClick={() => search()} disabled={loading}>
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </Button>
              <Button variant="secondary" onClick={useLocation} disabled={loading}>
                <LocateFixed className="h-4 w-4" aria-hidden="true" />
                Use location
              </Button>
            </div>
          </Card>

          <Card>
            <CardTitle>Verification reminder</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Halal listings may be incomplete or outdated. Call the restaurant or masjid directly for current hours, jama&apos;ah times, certification, and meat sourcing.
            </p>
          </Card>
        </div>

        <div className="space-y-3">
          {loading ? <LoadingState label="Searching nearby places" /> : null}
          {error ? <EmptyState title="Search issue" body={error} /> : null}
          {data ? (
            <>
              <Card>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-ink dark:text-white">
                      {data.results.length} {type === "masjid" ? "masjid" : "halal food"} results
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{data.origin.label}</p>
                  </div>
                  <Badge>OpenStreetMap</Badge>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{data.attribution}</p>
              </Card>
              {data.results.length ? (
                data.results.map((place) => (
                  <Card key={place.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge>{place.type === "masjid" ? "Masjid" : "Halal food"}</Badge>
                          {typeof place.distanceKm === "number" ? <Badge>{place.distanceKm} km</Badge> : null}
                        </div>
                        <h3 className="mt-3 text-xl font-semibold text-ink dark:text-white">{place.name}</h3>
                        {place.address ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{place.address}</p> : null}
                      </div>
                      {place.latitude && place.longitude ? (
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=17/${place.latitude}/${place.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center rounded-lg border border-reed/20 px-3 text-sm font-medium text-reed transition hover:bg-reed/10 dark:border-teal-200/20 dark:text-teal-200"
                        >
                          Map
                        </a>
                      ) : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      {place.phone ? <Badge>{place.phone}</Badge> : null}
                      {place.website ? (
                        <a className="text-reed underline dark:text-teal-200" href={place.website} target="_blank" rel="noreferrer">
                          Website
                        </a>
                      ) : null}
                    </div>
                  </Card>
                ))
              ) : (
                <EmptyState title="No results found" body="Try a wider radius or another city. OpenStreetMap coverage varies by area." />
              )}
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
