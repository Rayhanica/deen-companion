# Deen Companion Ecosystem Architecture

## Product vision

Deen Companion is a lifelong Islamic companion that grows with a user from shahadah to old age. It combines worship, verified learning, personal knowledge, family life, community participation, memorization, and source-aware AI without presenting software as a substitute for qualified scholarship.

## Information architecture

The five primary destinations are intent-based:

1. **Home** — what matters now: prayer, daily worship, continuation, revision, recommendations.
2. **Quran** — reading, understanding, vocabulary, reflection, memorization, and teacher feedback.
3. **Learn** — paths, courses, articles, books, source research, quizzes, certificates, and fatwa comparison.
4. **Community** — masjids, classes, events, teachers, study circles, khutbahs, and service.
5. **Profile** — identity, preferences, progress, family, personal vault, subscriptions, and offline packs.

Prayer, duas, AI, maps, family, and admin remain accessible as contextual tools rather than competing primary destinations.

## Service boundaries

- **Identity and tenancy:** Supabase Auth, profiles, households, organizations, memberships.
- **Verified knowledge:** Quran, hadith, tafsir, scholars, sources, topics, articles, fatwa opinions.
- **Learning:** courses, modules, lessons, quizzes, attempts, certificates, enrollments.
- **Quran and hifz:** ayahs, translations, words, roots, plans, reviews, submissions, feedback.
- **Personal knowledge:** bookmarks, notes, highlights, collections, legacy entries.
- **Community:** organizations, masjids, restaurants, events, classes, volunteer work, teachers, khutbahs.
- **Intelligence:** search documents, embeddings, recommendations, AI threads, retrieval traces.
- **Offline:** content-pack manifests, checksums, service-worker cache, idempotent sync mutations.

## Search architecture

The database migration creates `search_documents` with:

- weighted PostgreSQL full-text search;
- trigram title matching;
- optional `vector(1536)` embeddings;
- source, scholar, topic, locale, review status, and authority metadata;
- `search_knowledge` for ranked lexical retrieval;
- `hybrid_search_knowledge` for lexical plus semantic retrieval.

The API uses Supabase first when configured, then the bundled source index and Quran API fallback. Private notes remain client-filtered until the signed-in search API passes an authenticated user context.

## AI retrieval workflow

1. Parse mode, user level, question, and safety domain.
2. Retrieve verified local records.
3. Retrieve Quran, hadith, and tafsir passages.
4. Retrieve explicit scholarly-opinion records for difference-sensitive questions.
5. Use trusted external sources only when the local corpus is insufficient.
6. Use general web search last and label it clearly.
7. Generate with citations, confidence, retrieval trace, and a scholarly-difference status.
8. Store only when the user is signed in and consents to AI history.

AI must never infer consensus merely from similar search results. Consensus, majority, minority, and valid disagreement are editorial fields in `fatwa_opinions`.

## Recommendation engine

The initial API is rules-based and transparent. It uses:

- journey stage and interests;
- enrolled paths and completed lessons;
- recent search and reading history;
- hifz review state;
- Hijri season;
- explicit dismiss/open feedback.

The database stores recommendation scores and reasons. A later ranking model can replace rules while preserving the same API contract.

## Offline architecture

- The service worker caches the application shell and successful Quran, prayer, search, and source responses.
- Downloadable packs use versioned manifests, checksums, locale, and explicit licenses.
- Mutations are queued with client-generated idempotency keys.
- Conflict policy is entity-specific: append-only reviews, last-write-wins preferences, and merge-required notes.
- Full Quran text can ship as a licensed core pack; audio, translations, tafsir, and books are optional packs.

## Scale to millions

- Keep source content immutable and versioned.
- Partition high-volume tables such as AI history, search analytics, and memorization reviews by time or user hash.
- Store audio and downloadable packs in object storage, not Postgres.
- Build embeddings asynchronously with queues.
- Use CDN caching for public content and signed URLs for private submissions.
- Read public knowledge through database replicas/search services; write user progress to the primary database.
- Use organization tenancy and row-level security for schools, masjids, and academies.

## Mobile strategy

The Next.js application is the PWA and web control plane. The Expo app should share:

- TypeScript domain types;
- API contracts;
- validation schemas;
- localization keys;
- design tokens;
- sync and recommendation logic.

Native-only modules own push notifications, widgets, lock-screen prayer countdowns, audio recording, background downloads, and secure local databases.
