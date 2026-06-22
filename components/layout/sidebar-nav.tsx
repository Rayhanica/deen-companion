"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Bot, Compass, GraduationCap, HandHeart, Home, MapPin, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quran", label: "Quran", icon: BookOpen },
  { href: "/prayer", label: "Prayer", icon: Compass },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/duas", label: "Duas", icon: HandHeart },
  { href: "/profile", label: "Profile", icon: UserRound }
];

const secondaryItems = [
  { href: "/ai", label: "AI Guide", icon: Bot },
  { href: "/find", label: "Find Nearby", icon: MapPin }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-black/5 bg-white/68 px-4 py-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] md:block">
      <Link href="/" className="mb-8 flex items-center gap-3 rounded-lg px-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-reed text-lg font-bold text-white">
          DC
        </span>
        <span>
          <span className="block text-base font-semibold text-ink dark:text-white">Deen Companion</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">Daily worship, simply</span>
        </span>
      </Link>
      <nav className="space-y-1" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                active
                  ? "bg-reed text-white shadow-sm"
                  : "text-slate-600 hover:bg-reed/10 hover:text-reed dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <nav className="mt-8 space-y-1" aria-label="More tools">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Tools</p>
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                active
                  ? "bg-reed text-white shadow-sm"
                  : "text-slate-600 hover:bg-reed/10 hover:text-reed dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
