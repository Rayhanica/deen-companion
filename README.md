# Deen Companion

Deen Companion is a modern all-in-one Islamic web app MVP for Quran learning, prayer times, Hadith, duas, Islamic knowledge, lifestyle tracking, and user progress. It is built with Next.js, TypeScript, Tailwind CSS, and optional Supabase auth/cloud sync.

## What is included

- Quran reader with Arabic, English translation, transliteration, audio, surah/juz navigation, ayah bookmarks, favorites, notes, memorization tracking, daily goal, repeat audio, and tajweed starter lessons.
- Prayer tools with city search, device-location timings, next-prayer countdown, qibla direction, browser reminders, monthly calendar, calculation method, and Asr school settings.
- Hadith library with collections roadmap, category search, bookmarks, and daily hadith.
- Duas and dhikr with categories, Arabic/transliteration/translation, favorites, daily dua prompt, and tasbih counters.
- Learn section with detailed study guides, Arabic/Quran lessons, tajweed rules, fatwa literacy, Islamic history, seerah, Prophets’ stories, numbered linked footnotes, and a source library.
- Source explorer covering all 6,236 Quran ayahs through full-Quran search, reviewed app content, linked hadith references, recent searches, and a curated external directory.
- Intent-based navigation with Home, Quran, Learn, Community, and Profile.
- Global search across public knowledge plus private guest notes.
- Structured learning paths, local family profiles, personal knowledge vault, recommendation API, and community hub.
- Scalable relational migration for Quran words/roots, hadith, tafsir, courses, scholar review, fatwa comparison, hifz, community, AI history, and offline synchronization.
- Quran tafsir and deeper per-ayah study prompts, backed by Quran.com tafsir resources when available.
- AI learning companion with explicit capability status, reviewed local retrieval, source research without a paid key, and optional OpenAI Responses API/web search with clickable citations.
- Masjid and halal restaurant finder using OpenStreetMap/Nominatim/Overpass data with attribution.
- Home dashboard with next prayer, daily ayah, daily hadith, daily dua, today’s deeds, fasting tracker, streak signal, and progress.
- Profile with guest mode, Supabase sign in/sign up, cloud sync status, preferences, goals, and progress.
- Admin/content dashboard for structured JSON content.
- Supabase schema and seed data.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase auth and database sync
- Public Islamic API wrappers through Next.js routes

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment example:

   ```bash
   cp .env.example .env.local
   ```

3. Optional Supabase setup:

   - Create a Supabase project.
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
   - Run `supabase/schema.sql` in the Supabase SQL editor.
   - Run `supabase/migrations/202606240001_ecosystem_foundation.sql`.
   - Optional: run `supabase/seed.sql` and `supabase/seed_ecosystem.sql`.

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

The app works in guest mode without Supabase. Guest progress is saved in browser local storage.

## Environment variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
HADITH_API_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
```

`HADITH_API_KEY` is reserved for a future server-side Hadith API integration. Do not expose private API keys with `NEXT_PUBLIC_`.

Without `OPENAI_API_KEY`, the guide still searches reviewed app content and all 6,236 translated Quran ayahs. Add the key to enable GPT-5.5 generation and hosted live web search.

## Data and sources

- Quran: Al Quran Cloud REST API for Arabic text, translations, transliteration, audio, surah, and juz data.
- Prayer times: AlAdhan API for timings, monthly calendar, calculation settings, school parameter, Hijri date, and qibla.
- Quran production upgrade: Quran Foundation/Quran.com APIs and SDK when API access is approved.
- Hadith MVP: curated local seed data with direct Sunnah.com reference links. Expand with a reviewed provider/API on the server.
- Knowledge and duas: structured JSON content with references and editorial review.
- AI companion: reviewed local/source-search fallback plus optional OpenAI Responses API. Web browsing uses the hosted `web_search` tool when enabled and configured.
- Nearby finder: OpenStreetMap, Nominatim, and Overpass. Display attribution and verify halal status directly.

See `docs/API_SOURCES.md` for source notes.
See `docs/ECOSYSTEM_ARCHITECTURE.md`, `docs/CONTENT_INGESTION.md`, and `docs/ECOSYSTEM_ROADMAP.md` for the platform architecture and delivery plan.

## Project structure

```txt
app/
  api/                 Stable server wrappers for Quran, prayer, hadith
  admin/               Content management helper
  duas/                Duas and dhikr
  learn/               Knowledge database
  learn/hadith/        Hadith library
  prayer/              Prayer tools
  profile/             Auth, preferences, goals
  quran/               Quran reader
components/
  features/            Feature screens
  layout/              App shell and navigation
  ui/                  Shared primitives
content/               Seed JSON content
docs/                  Plan and API notes
hooks/                 Client hooks
lib/                   Types, API clients, state, utilities
supabase/              Schema and seeds
```

## Database

The MVP uses `public.user_app_state` for cloud-syncing the complete user state JSON. This keeps the MVP fast to evolve while still supporting Supabase auth and database persistence. The schema also includes `profiles` and `content_items` for production expansion.

Run:

```sql
-- supabase/schema.sql
-- supabase/seed.sql
```

## Quality notes

- External API calls are wrapped by app routes so UI components do not depend directly on third-party URLs.
- Saved progress has a guest fallback and Supabase sync path.
- Content is structured and reference-friendly.
- UI includes loading states, empty states, error handling, accessible labels, responsive layout, and light/dark mode.

## Premium features

- Advanced Quran memorization plans with spaced repetition, reciter selection, and mistake logs.
- Family dashboards for parents, children, and Quran teachers.
- AI-assisted Quran vocabulary and tafsir summaries with scholar-reviewed guardrails.
- Prayer analytics, mosque jama'ah times, travel mode, and smart reminders.
- Ramadan program builder with meal planning, khatam planner, charity goals, and nightly worship schedule.
- Teacher/student hifz portal with assignments and audio submissions.
- Offline Quran/audio packs.

## Monetization ideas

- Freemium app with free core worship tools and paid advanced tracking.
- Family plan for shared goals, child profiles, and parent dashboards.
- Teacher or maktab plan for hifz class management.
- Sponsored but carefully vetted Islamic courses or charity campaigns.
- One-time lifetime plan for users who dislike subscriptions.
- B2B white-label offering for masjids and Islamic schools.

## Roadmap

1. **MVP hardening**
   - Add tests for state sync, API route normalization, and key UI flows.
   - Add service-worker caching for saved duas, articles, and recent Quran passages.
   - Add full editorial review workflow.

2. **Content depth**
   - Expand Hadith collections with licensed/API-backed data.
   - Add tafsir summaries and more translations.
   - Add structured courses for converts, children, huffaz, and busy workers.

3. **Mobile and notifications**
   - Add PWA install prompts and service-worker push notifications.
   - Complete the Expo native client under `apps/mobile`, including SQLite packs, push notifications, widgets, and app-store builds.

4. **SaaS expansion**
   - Add subscriptions, organizations, teacher dashboards, family plans, and analytics.
   - Add admin roles, content approval, source audit logs, and versioning.
