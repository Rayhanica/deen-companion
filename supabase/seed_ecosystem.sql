-- Seed the ecosystem tables after applying 202606240001_ecosystem_foundation.sql.

insert into public.topics (slug, name, description, audience_tags)
values
  ('aqeedah', 'Aqeedah', 'Core Islamic beliefs and worldview.', array['new-muslim','student']),
  ('fiqh', 'Fiqh', 'Understanding Islamic rulings and valid scholarly differences.', array['practicing','student']),
  ('seerah', 'Seerah', 'The life and example of Prophet Muhammad ﷺ.', array['all']),
  ('history', 'Islamic History', 'People, institutions, civilizations, and major events.', array['student','family']),
  ('prophets', 'Stories of the Prophets', 'Quranic accounts and their lessons.', array['family','children']),
  ('companions', 'Companions', 'Lives and contributions of the Companions.', array['all']),
  ('tafsir', 'Tafsir', 'Explanation and contextual study of the Quran.', array['quran','student']),
  ('hadith-sciences', 'Hadith Sciences', 'Preservation, grading, and interpretation of hadith.', array['student']),
  ('tajweed', 'Tajweed', 'Accurate Quran recitation.', array['quran','hifz']),
  ('arabic', 'Arabic', 'Quranic vocabulary, roots, morphology, and grammar.', array['quran','student']),
  ('marriage', 'Marriage', 'Preparation, rights, responsibilities, and conflict repair.', array['family']),
  ('parenting', 'Parenting', 'Faith-centered parenting across life stages.', array['family']),
  ('business', 'Business', 'Ethics, contracts, entrepreneurship, and workplace conduct.', array['professional']),
  ('finance', 'Finance', 'Zakah, debt, inheritance, and halal investing foundations.', array['professional']),
  ('mental-health', 'Mental Health', 'Spiritually integrated wellbeing with appropriate professional referral.', array['all']),
  ('dawah', 'Dawah', 'Wisdom, communication, and responsible invitation.', array['student','community']),
  ('women', 'Women''s Issues', 'Worship, family, scholarship, and life-stage questions.', array['women']),
  ('youth', 'Youth Issues', 'Identity, worship, relationships, school, and digital life.', array['youth','family']),
  ('character', 'Character', 'Adab, sincerity, patience, mercy, and responsibility.', array['all']),
  ('hereafter', 'Death and Hereafter', 'Death, grief, accountability, and preparation.', array['all']),
  ('hajj', 'Hajj', 'Preparation and rites of Hajj.', array['traveler']),
  ('umrah', 'Umrah', 'Preparation and rites of Umrah.', array['traveler']),
  ('ramadan', 'Ramadan', 'Fasting, Quran, prayer, charity, and seasonal planning.', array['all']),
  ('zakat', 'Zakah', 'Principles, assets, recipients, and calculation workflow.', array['professional']),
  ('fasting', 'Fasting', 'Ramadan, voluntary fasting, exemptions, and make-up fasts.', array['all']),
  ('prayer', 'Prayer', 'Salah, khushu, congregation, travel, and special circumstances.', array['all']),
  ('purification', 'Purification', 'Wudu, ghusl, cleanliness, and special circumstances.', array['all'])
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  audience_tags = excluded.audience_tags;

insert into public.sources (slug, kind, title, author, language, canonical_url, license_name, ingestion_allowed, citation_template)
values
  ('quran-uthmani', 'quran', 'The Noble Quran — Uthmani Text', null, 'ar', 'https://tanzil.net/docs/home', 'Tanzil Quran Text License', true, 'Quran {surah}:{ayah}'),
  ('saheeh-international', 'quran', 'Saheeh International Translation', 'Saheeh International', 'en', 'https://quran.com/', 'Provider terms apply', false, 'Quran {surah}:{ayah}, Saheeh International'),
  ('sahih-bukhari', 'hadith', 'Sahih al-Bukhari', 'Imam al-Bukhari', 'ar', 'https://sunnah.com/bukhari', 'Provider terms apply', false, 'Sahih al-Bukhari {number}'),
  ('sahih-muslim', 'hadith', 'Sahih Muslim', 'Imam Muslim', 'ar', 'https://sunnah.com/muslim', 'Provider terms apply', false, 'Sahih Muslim {number}'),
  ('forty-nawawi', 'hadith', 'Forty Hadith of Imam Nawawi', 'Imam al-Nawawi', 'ar', 'https://sunnah.com/nawawi40', 'Provider terms apply', false, 'Nawawi 40, Hadith {number}'),
  ('tafsir-ibn-kathir', 'tafsir', 'Tafsir Ibn Kathir', 'Ibn Kathir', 'ar', 'https://quran.com/tafsirs/en-tafisr-ibn-kathir', 'Licensed provider access required', false, 'Tafsir Ibn Kathir on Quran {surah}:{ayah}')
on conflict (slug) do update set
  title = excluded.title,
  canonical_url = excluded.canonical_url,
  license_name = excluded.license_name,
  ingestion_allowed = excluded.ingestion_allowed;

insert into public.scholars (slug, display_name, arabic_name, biography, era, region, madhhab, languages, verified)
values
  ('imam-al-bukhari', 'Imam al-Bukhari', 'الإمام البخاري', 'Compiler of Sahih al-Bukhari and a leading hadith scholar.', '194–256 AH', 'Bukhara and Khurasan', 'Shafi''i-associated', array['ar'], true),
  ('imam-muslim', 'Imam Muslim', 'الإمام مسلم', 'Compiler of Sahih Muslim and a leading hadith scholar.', '206–261 AH', 'Nishapur', null, array['ar'], true),
  ('imam-al-nawawi', 'Imam al-Nawawi', 'الإمام النووي', 'Shafi''i jurist, hadith scholar, and author of Riyad as-Salihin and Forty Hadith.', '631–676 AH', 'Syria', 'Shafi''i', array['ar'], true),
  ('ibn-kathir', 'Ibn Kathir', 'ابن كثير', 'Historian, hadith scholar, and Quran commentator.', '701–774 AH', 'Syria', 'Shafi''i', array['ar'], true)
on conflict (slug) do update set
  biography = excluded.biography,
  verified = excluded.verified;

insert into public.courses (slug, title, description, audience, level, estimated_weeks, status, certificate_enabled)
values
  ('new-muslim-foundations', 'New Muslim Foundations', 'Belief, purification, prayer, Quran, daily worship, and community integration.', array['new-muslim','returning'], 'beginner', 12, 'published', true),
  ('quranic-arabic-foundations', 'Quranic Arabic Foundations', 'Reading, vocabulary, roots, morphology, and introductory grammar.', array['arabic-learner','quran-student'], 'beginner', 16, 'published', true),
  ('juz-amma-90-days', 'Memorize Juz Amma in 90 Days', 'Daily memorization, spaced revision, weak-ayah tracking, and assessments.', array['hifz','quran-student'], 'beginner', 13, 'published', true),
  ('student-of-knowledge-roadmap', 'Student of Knowledge Roadmap', 'A one-year supervised introduction to the core Islamic sciences.', array['student'], 'advanced', 52, 'published', true)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  audience = excluded.audience,
  status = excluded.status;

insert into public.course_modules (course_id, title, description, sort_order)
select courses.id, seed.title, seed.description, seed.sort_order
from public.courses courses
join (
  values
    ('new-muslim-foundations', 'Beginning with certainty', 'Shahadah, tawhid, iman, and safe learning.', 1),
    ('new-muslim-foundations', 'Daily worship', 'Wudu, salah, Quran, and dhikr.', 2),
    ('quranic-arabic-foundations', 'Reading fluency', 'Letters, vowels, joined words, and mushaf reading.', 1),
    ('quranic-arabic-foundations', 'Vocabulary and roots', 'High-frequency words and three-letter roots.', 2),
    ('juz-amma-90-days', 'New memorization', 'Daily new ayahs with listening and repetition.', 1),
    ('juz-amma-90-days', 'Revision system', 'Spaced repetition and weak-ayah repair.', 2),
    ('student-of-knowledge-roadmap', 'Tools of study', 'Etiquette, Arabic, research, and note systems.', 1),
    ('student-of-knowledge-roadmap', 'Core sciences', 'Aqeedah, fiqh, usul, hadith, and tafsir.', 2)
) as seed(course_slug, title, description, sort_order)
  on courses.slug = seed.course_slug
where not exists (
  select 1 from public.course_modules existing
  where existing.course_id = courses.id and existing.title = seed.title
);

insert into public.search_documents (
  entity_type, entity_key, title, summary, body, locale, topic_slugs, authority_weight, review_status, url, metadata
)
select
  'course',
  courses.slug,
  courses.title,
  courses.description,
  array_to_string(courses.audience, ' '),
  courses.locale,
  array[]::text[],
  0.8,
  courses.status,
  '/learn/paths?path=' || courses.slug,
  jsonb_build_object('provider', 'Deen Companion verified curriculum', 'weeks', courses.estimated_weeks)
from public.courses courses
on conflict (entity_type, entity_key, locale) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  review_status = excluded.review_status,
  url = excluded.url,
  metadata = excluded.metadata,
  updated_at = now();
