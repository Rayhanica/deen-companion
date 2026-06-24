"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import { useUserState } from "@/lib/user-state";
import { GlobalSearch } from "@/components/features/global-search";

export function TopBar() {
  const { state, updatePreferences, session, cloudSync } = useUserState();
  const dark = state.preferences.theme === "dark";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#101714]/90 md:px-7 xl:px-9">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[minmax(150px,0.45fr)_minmax(280px,1fr)_auto]">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark className="h-9 w-9 border border-amber-300/30 md:hidden" priority />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink dark:text-white">Deen Companion</p>
            <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
              {session ? "Cloud profile" : "Guest mode"} · {cloudSync === "disabled" ? "Local saves" : cloudSync}
            </p>
          </div>
        </div>
        <div className="col-span-2 row-start-2 md:col-span-1 md:row-start-auto">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={state.preferences.notifications ? "Notifications enabled" : "Notifications disabled"}
            title={state.preferences.notifications ? "Notifications enabled" : "Notifications disabled"}
            onClick={() => updatePreferences({ notifications: !state.preferences.notifications })}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label={dark ? "Use light mode" : "Use dark mode"}
            title={dark ? "Use light mode" : "Use dark mode"}
            onClick={() => updatePreferences({ theme: dark ? "light" : "dark" })}
          >
            {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
