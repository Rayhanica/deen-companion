"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserState } from "@/lib/user-state";

export function TopBar() {
  const { state, updatePreferences, session, cloudSync } = useUserState();
  const dark = state.preferences.theme === "dark";

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/72 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/72 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0 md:hidden">
          <p className="truncate text-sm font-semibold text-ink dark:text-white">Deen Companion</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {session ? "Cloud profile" : "Guest mode"} · {cloudSync === "disabled" ? "Local saves" : cloudSync}
          </p>
        </div>
        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            {session ? session.user.email : "Guest mode"} · {cloudSync === "disabled" ? "Local saves" : cloudSync}
          </p>
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
