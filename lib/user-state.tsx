"use client";

import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_USER_STATE } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import type { UserAppState, UserPreferences } from "@/lib/types";
import { todayKey, toggleValue } from "@/lib/utils";

type UserStateContextValue = {
  state: UserAppState;
  session: Session | null;
  authReady: boolean;
  cloudSync: "disabled" | "syncing" | "synced" | "error";
  updateState: (updater: (state: UserAppState) => UserAppState) => void;
  toggleAyahBookmark: (key: string) => void;
  toggleAyahFavorite: (key: string) => void;
  setAyahNote: (key: string, note: string) => void;
  toggleMemorizedAyah: (key: string) => void;
  toggleDeed: (goalId: string, date?: string) => void;
  toggleDuaFavorite: (id: string) => void;
  toggleHadithBookmark: (id: string) => void;
  incrementTasbih: (id: string, amount?: number) => void;
  resetTasbih: (id: string) => void;
  toggleFastingDay: (date?: string) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const UserStateContext = createContext<UserStateContextValue | undefined>(undefined);

function mergeState(base: UserAppState, incoming?: Partial<UserAppState> | null): UserAppState {
  return {
    ...base,
    ...incoming,
    preferences: {
      ...base.preferences,
      ...(incoming?.preferences ?? {})
    },
    goals: incoming?.goals?.length ? incoming.goals : base.goals,
    updatedAt: incoming?.updatedAt ?? base.updatedAt
  };
}

function stamp(state: UserAppState): UserAppState {
  return { ...state, updatedAt: new Date().toISOString() };
}

export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserAppState>(DEFAULT_USER_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [cloudSync, setCloudSync] = useState<UserStateContextValue["cloudSync"]>(
    supabase ? "syncing" : "disabled"
  );
  const loadedRemoteFor = useRef<string | null>(null);
  const skipNextSync = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("deen-companion-state");
    if (saved) {
      try {
        setState(mergeState(DEFAULT_USER_STATE, JSON.parse(saved) as Partial<UserAppState>));
      } catch {
        setState(DEFAULT_USER_STATE);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("deen-companion-state", JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
      loadedRemoteFor.current = null;
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user.id || !hydrated) return;
    if (loadedRemoteFor.current === session.user.id) return;

    let cancelled = false;
    setCloudSync("syncing");

    supabase
      .from("user_app_state")
      .select("state")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setCloudSync("error");
          return;
        }

        if (data?.state) {
          const remote = mergeState(DEFAULT_USER_STATE, data.state as Partial<UserAppState>);
          setState((local) => {
            const remoteTime = Date.parse(remote.updatedAt);
            const localTime = Date.parse(local.updatedAt);
            skipNextSync.current = remoteTime > localTime;
            return remoteTime > localTime ? remote : local;
          });
        }

        loadedRemoteFor.current = session.user.id;
        setCloudSync("synced");
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, session?.user.id]);

  useEffect(() => {
    if (!supabase || !session?.user.id || !hydrated || loadedRemoteFor.current !== session.user.id) return;
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    const client = supabase;
    const userId = session.user.id;
    setCloudSync("syncing");
    const timeout = window.setTimeout(() => {
      client
        .from("user_app_state")
        .upsert({ user_id: userId, state }, { onConflict: "user_id" })
        .then(({ error }) => setCloudSync(error ? "error" : "synced"));
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [hydrated, session?.user.id, state]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", state.preferences.theme === "dark");
    document.documentElement.classList.toggle("accessibility", Boolean(state.preferences.accessibilityMode));
  }, [hydrated, state.preferences.accessibilityMode, state.preferences.theme]);

  const updateState = useCallback((updater: (state: UserAppState) => UserAppState) => {
    setState((current) => stamp(updater(current)));
  }, []);

  const value = useMemo<UserStateContextValue>(
    () => ({
      state,
      session,
      authReady,
      cloudSync,
      updateState,
      toggleAyahBookmark: (key) =>
        updateState((current) => ({ ...current, ayahBookmarks: toggleValue(current.ayahBookmarks, key) })),
      toggleAyahFavorite: (key) =>
        updateState((current) => ({ ...current, ayahFavorites: toggleValue(current.ayahFavorites, key) })),
      setAyahNote: (key, note) =>
        updateState((current) => ({
          ...current,
          ayahNotes: note.trim()
            ? { ...current.ayahNotes, [key]: note }
            : Object.fromEntries(Object.entries(current.ayahNotes).filter(([id]) => id !== key))
        })),
      toggleMemorizedAyah: (key) =>
        updateState((current) => ({ ...current, memorizedAyahs: toggleValue(current.memorizedAyahs, key) })),
      toggleDeed: (goalId, date = todayKey()) =>
        updateState((current) => ({
          ...current,
          completedDeeds: {
            ...current.completedDeeds,
            [date]: toggleValue(current.completedDeeds[date] ?? [], goalId)
          }
        })),
      toggleDuaFavorite: (id) =>
        updateState((current) => ({ ...current, duaFavorites: toggleValue(current.duaFavorites, id) })),
      toggleHadithBookmark: (id) =>
        updateState((current) => ({ ...current, hadithBookmarks: toggleValue(current.hadithBookmarks, id) })),
      incrementTasbih: (id, amount = 1) =>
        updateState((current) => ({
          ...current,
          tasbihCounts: { ...current.tasbihCounts, [id]: Math.max(0, (current.tasbihCounts[id] ?? 0) + amount) }
        })),
      resetTasbih: (id) =>
        updateState((current) => ({ ...current, tasbihCounts: { ...current.tasbihCounts, [id]: 0 } })),
      toggleFastingDay: (date = todayKey()) =>
        updateState((current) => ({ ...current, fastingDays: toggleValue(current.fastingDays, date) })),
      updatePreferences: (preferences) =>
        updateState((current) => ({ ...current, preferences: { ...current.preferences, ...preferences } })),
      signIn: async (email, password) => {
        if (!supabase) return { error: "Supabase is not configured. Guest mode is active." };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message };
      },
      signUp: async (email, password) => {
        if (!supabase) return { error: "Supabase is not configured. Guest mode is active." };
        const { error } = await supabase.auth.signUp({ email, password });
        return { error: error?.message };
      },
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
      }
    }),
    [authReady, cloudSync, session, state, updateState]
  );

  return <UserStateContext.Provider value={value}>{children}</UserStateContext.Provider>;
}

export function useUserState() {
  const context = useContext(UserStateContext);
  if (!context) throw new Error("useUserState must be used inside UserStateProvider");
  return context;
}
