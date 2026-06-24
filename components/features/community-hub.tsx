"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  MapPin,
  Megaphone,
  Search,
  UsersRound
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/state";
import { communityData } from "@/lib/content";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "all", label: "All", icon: UsersRound },
  { id: "event", label: "Events", icon: CalendarDays },
  { id: "class", label: "Classes", icon: GraduationCap },
  { id: "circle", label: "Study circles", icon: UsersRound },
  { id: "volunteer", label: "Volunteer", icon: HandHeart },
  { id: "teacher", label: "Teachers", icon: CheckCircle2 }
];

export function CommunityHub() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return communityData.filter((item) => {
      const typeMatches = tab === "all" || item.type === tab;
      const textMatches =
        !needle ||
        `${item.title} ${item.organization} ${item.location} ${item.description} ${item.tags.join(" ")}`
          .toLowerCase()
          .includes(needle);
      return typeMatches && textMatches;
    });
  }, [query, tab]);

  return (
    <div>
      <PageHeader
        eyebrow="Community"
        title="Learn, serve, and connect locally"
        body="Masjids, events, classes, study circles, teachers, announcements, and volunteer opportunities."
        actions={
          <Link href="/find" className="inline-flex h-10 items-center gap-2 rounded-lg bg-reed px-4 text-sm font-medium text-white">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Open local map
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/find" className="rounded-lg border border-slate-200/80 bg-white p-4 transition hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.045]">
          <MapPin className="h-5 w-5 text-reed dark:text-teal-200" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-ink dark:text-white">Masjid directory</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Find nearby masjids and community spaces.</p>
        </Link>
        <Link href="/find?type=halal" className="rounded-lg border border-slate-200/80 bg-white p-4 transition hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.045]">
          <Search className="h-5 w-5 text-reed dark:text-teal-200" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-ink dark:text-white">Halal directory</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Discover restaurants and verify halal status directly.</p>
        </Link>
        <Link href="/prayer" className="rounded-lg border border-slate-200/80 bg-white p-4 transition hover:border-reed/30 dark:border-white/10 dark:bg-white/[0.045]">
          <Megaphone className="h-5 w-5 text-reed dark:text-teal-200" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-ink dark:text-white">Jumu&apos;ah and prayer tools</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Prayer schedule, qibla, reminders, and calendar.</p>
        </Link>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:bg-amber-300/10 dark:text-amber-100">
          Directory cards below are seed examples. Live organizations and verified listings are loaded from Supabase and the local map.
        </p>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search classes, events, teachers, or volunteer work"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-ink outline-none focus:border-reed dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium",
                  tab === item.id ? "bg-reed text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5 grid gap-3 lg:grid-cols-2">
        {results.map((item) => (
          <Card key={item.id} id={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{item.type}</Badge>
                {item.verified ? <Badge className="bg-reed/10 text-reed dark:text-teal-200">Reviewed sample</Badge> : null}
              </div>
              <span className="text-xs text-slate-400">{item.schedule}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-ink dark:text-white">{item.title}</h2>
            <p className="mt-1 text-sm font-medium text-reed dark:text-teal-200">{item.organization}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {item.location}
              </span>
              {item.href ? (
                <Link href={item.href} className="text-sm font-medium text-reed dark:text-teal-200">
                  Open
                </Link>
              ) : (
                <span className="text-xs font-medium text-slate-400">Sample listing</span>
              )}
            </div>
          </Card>
        ))}
      </section>

      {!results.length ? <EmptyState title="No community listings found" body="Try another category or search term." /> : null}
    </div>
  );
}
