# Content Ingestion and Verification

## Non-negotiable rule

“Thousands of local articles” must not mean scraped or copied copyrighted books, tafsir, translations, fatwas, or course material. Every imported corpus requires a recorded source, license, permitted use, version, language, and checksum.

## Ingestion pipeline

1. **Register source** in `sources`.
2. **Record rights**: public domain, explicit license, provider agreement, or link-only.
3. **Normalize identifiers**: Quran ayah key, hadith collection/number, scholar slug, book locator.
4. **Import immutable source records**.
5. **Create summaries or lessons** as separate authored records.
6. **Attach references** through `content_references`.
7. **Run editorial review** for accuracy, context, and attribution.
8. **Run scholar review** for sensitive theology, legal rulings, family, finance, medicine, and community safety.
9. **Publish and index** only verified records.
10. **Version and audit** every later change.

## Corpus priority

1. Licensed Quran text and translations.
2. Word-by-word morphology and root data with explicit reuse rights.
3. Licensed or provider-approved hadith collections.
4. Link-first tafsir access until text licensing is secured.
5. Original Deen Companion curricula referencing primary sources.
6. Institution-provided fatwa metadata with links; do not republish full answers without permission.
7. Scholar and organization profiles with verification.

## Review labels

- **Reviewed by scholar** — named qualified reviewer approved the current version.
- **Classical source** — direct source record, not a modern ruling.
- **Editorially reviewed** — sources and wording checked, but no scholar ruling implied.
- **Community submitted** — not yet verified.
- **AI-assisted summary** — machine-assisted draft with human review status shown.

## Thousands-of-items plan

- Phase A: ingest the 6,236 ayah index and licensed translations.
- Phase B: ingest word/root/morphology records.
- Phase C: ingest metadata and permitted text for major hadith collections.
- Phase D: publish 500 original beginner articles across the 27 core topics.
- Phase E: create intermediate and advanced layers from verified editorial briefs.
- Phase F: add scholar-reviewed fatwa comparisons and book reading guides.

Each stage has coverage, review, correction, and licensing metrics. Item count is not a quality target by itself.
