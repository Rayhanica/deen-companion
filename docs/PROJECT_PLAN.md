# Deen Companion Project Plan

## Product goal
Build a beginner-friendly, spiritually uplifting Islamic companion app that combines Quran learning, prayer tools, Hadith, duas, Islamic knowledge, daily habits, and user progress in one responsive web MVP.

## MVP scope
1. **Foundation**
   - Next.js App Router, TypeScript, Tailwind CSS.
   - Supabase auth and cloud state sync, with guest/local storage fallback.
   - Reusable cards, navigation, loading, empty, and error states.
   - Light/dark mode.

2. **Quran Learning**
   - Surah and Juz navigation powered by Al Quran Cloud API.
   - Arabic, English translation, transliteration, and audio where available.
   - Ayah bookmarks, favorites, notes, memorization status, progress percentage.
   - Repeat audio controls for hifz practice.
   - Daily Quran goal and beginner tajweed lessons.

3. **Prayer Tools**
   - Location-based timings and city/country search through AlAdhan.
   - Fajr, Dhuhr, Asr, Maghrib, Isha, next-prayer countdown.
   - Qibla direction, monthly calendar, madhab/school and calculation method settings.
   - Browser notification reminders while the app is open.

4. **Hadith**
   - Seeded reliable collection cards, categories, search, bookmarks, daily hadith.
   - Optional server-side Hadith API integration when an API key is supplied.

5. **Duas & Dhikr**
   - Categorized duas with Arabic, transliteration, translation, references.
   - Favorite duas, daily dua, and tasbih counter.

6. **Knowledge and Lifestyle**
   - Searchable structured articles with simple language and references.
   - Daily deeds checklist, habit/goal tracking, Ramadan and fasting tracker, Islamic calendar dates.
   - Disclaimer for specific legal rulings.

7. **Admin/content system**
   - Structured JSON content files for duas, hadith samples, knowledge, tajweed, goals, and dates.
   - Admin dashboard to review content and compose new structured entries.

## File/folder structure
```txt
app/
  api/                         Server API wrappers for Quran, prayer, hadith
  admin/                       Content admin dashboard
  duas/                        Duas and dhikr page
  learn/                       Knowledge database
  learn/hadith/                Hadith library
  prayer/                      Prayer tools
  profile/                     Auth, profile, preferences, goals
  quran/                       Quran reader and tajweed
  layout.tsx
  page.tsx                     Home dashboard
components/
  features/                    Feature-specific panels and views
  layout/                      App shell, nav, header
  ui/                          Shared visual primitives
content/                       JSON seed content and source metadata
docs/                          Plan and API notes
hooks/                         Reusable client hooks
lib/                           API clients, Supabase, state, utilities, types
supabase/                      SQL schema and seed data
```

## Implementation phases
1. Scaffold configuration and shared UI.
2. Add content models, seed data, and source metadata.
3. Implement Supabase auth and user-state sync with guest fallback.
4. Implement feature pages and server API wrappers.
5. Add README, environment examples, SQL schema, and seed data.
6. Build, typecheck, and run locally.

## Expansion path
- Replace JSON content with a CMS or Supabase content tables.
- Add service-worker push notifications and offline Quran caching.
- Add Quran.com OAuth/user APIs for richer Quran user data.
- Add native Expo wrapper if App Store/Play Store distribution becomes a priority.
