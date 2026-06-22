"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, GraduationCap, HandHeart, Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quran", label: "Quran", icon: BookOpen },
  { href: "/prayer", label: "Prayer", icon: Compass },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/duas", label: "Duas", icon: HandHeart },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/94 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(31,41,51,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/92 md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto grid max-w-lg grid-cols-6 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition",
                active
                  ? "bg-reed text-white shadow-sm"
                  : "text-slate-600 hover:bg-reed/10 hover:text-reed dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
