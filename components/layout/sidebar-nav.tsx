"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookHeart,
  BookOpen,
  Bot,
  Clock3,
  Database,
  GraduationCap,
  Home,
  MapPin,
  UsersRound,
  UserRound
} from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quran", label: "Quran", icon: BookOpen },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/community", label: "Community", icon: UsersRound },
  { href: "/profile", label: "Profile", icon: UserRound }
];

const secondaryItems = [
  { href: "/prayer", label: "Prayer & Qibla", icon: Clock3 },
  { href: "/duas", label: "Duas & Dhikr", icon: BookHeart },
  { href: "/ai", label: "Ask Deen Companion", icon: Bot },
  { href: "/learn?mode=sources", label: "Source Library", icon: Database },
  { href: "/find", label: "Masjid & Halal", icon: MapPin }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200/80 bg-white px-4 py-5 dark:border-white/10 dark:bg-[#131c18] md:block">
      <Link href="/" className="mb-8 flex items-center gap-3 rounded-lg px-2">
        <BrandMark className="h-11 w-11 border border-amber-300/40 shadow-sm" priority />
        <span>
          <span className="block text-base font-semibold text-ink dark:text-white">Deen Companion</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">Your deen. One companion.</span>
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
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                active
                  ? "bg-reed text-white"
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
                  ? "bg-reed text-white"
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
