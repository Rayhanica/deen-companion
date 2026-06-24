-- Deen Companion ecosystem foundation
-- Apply after supabase/schema.sql.

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";
create extension if not exists "pg_trgm";
create extension if not exists "vector" with schema extensions;

do $$ begin
  create type public.content_status as enum ('draft', 'in_review', 'changes_requested', 'verified', 'published', 'archived');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.review_verdict as enum ('pending', 'approved', 'changes_requested', 'rejected');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.content_level as enum ('beginner', 'intermediate', 'advanced', 'all_levels');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.reference_kind as enum ('quran', 'hadith', 'tafsir', 'book', 'fatwa', 'article', 'course', 'external');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.community_item_status as enum ('draft', 'submitted', 'verified', 'rejected', 'archived');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.ai_confidence as enum ('high', 'medium', 'low', 'insufficient');
exception when duplicate_object then null; end $$;

alter table public.profiles
  add column if not exists username text unique,
  add column if not exists locale text not null default 'en',
  add column if not exists timezone text not null default 'UTC',
  add column if not exists journey_stage text not null default 'growing',
  add column if not exists interests text[] not null default '{}',
  add column if not exists accessibility_preferences jsonb not null default '{}'::jsonb,
  add column if not exists recommendation_preferences jsonb not null default '{}'::jsonb;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('masjid', 'school', 'hifz_academy', 'publisher', 'scholar_institution', 'charity', 'community_group')),
  name text not null,
  slug text not null unique,
  description text,
  website_url text,
  logo_url text,
  verification_status public.community_item_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'teacher', 'imam', 'reviewer', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  role text not null check (role in ('parent', 'guardian', 'child', 'member')),
  birth_year smallint,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scholars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  arabic_name text,
  biography text,
  era text,
  region text,
  madhhab text,
  creed_tradition text,
  languages text[] not null default '{}',
  qualifications jsonb not null default '[]'::jsonb,
  organization_id uuid references public.organizations(id) on delete set null,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  kind public.reference_kind not null,
  title text not null,
  author text,
  publisher text,
  language text not null default 'en',
  edition text,
  publication_year integer,
  canonical_url text,
  license_name text,
  license_url text,
  ingestion_allowed boolean not null default false,
  citation_template text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.topics(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text,
  audience_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body_markdown text not null default '',
  level public.content_level not null default 'all_levels',
  locale text not null default 'en',
  status public.content_status not null default 'draft',
  author_id uuid references auth.users(id) on delete set null,
  primary_scholar_id uuid references public.scholars(id) on delete set null,
  source_disclosure text,
  ai_assisted boolean not null default false,
  estimated_minutes integer not null default 5,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.article_topics (
  article_id uuid not null references public.articles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  primary key (article_id, topic_id)
);

create table if not exists public.article_scholars (
  article_id uuid not null references public.articles(id) on delete cascade,
  scholar_id uuid not null references public.scholars(id) on delete cascade,
  relationship text not null default 'reviewer',
  primary key (article_id, scholar_id, relationship)
);

create table if not exists public.content_references (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('article', 'lesson', 'fatwa_opinion', 'tafsir', 'khutbah', 'ai_answer')),
  owner_id uuid not null,
  source_id uuid references public.sources(id) on delete set null,
  kind public.reference_kind not null,
  label text not null,
  locator text,
  url text,
  quote_excerpt text,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists content_references_owner_idx on public.content_references(owner_type, owner_id);

create table if not exists public.quran_ayahs (
  id integer primary key,
  surah_number smallint not null check (surah_number between 1 and 114),
  ayah_number smallint not null,
  juz_number smallint not null check (juz_number between 1 and 30),
  page_number smallint,
  hizb_number smallint,
  rub_number smallint,
  arabic_uthmani text not null,
  arabic_simple text,
  sajdah boolean not null default false,
  unique (surah_number, ayah_number)
);

create table if not exists public.quran_translations (
  id bigserial primary key,
  ayah_id integer not null references public.quran_ayahs(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  locale text not null,
  translator text not null,
  text text not null,
  footnotes jsonb not null default '[]'::jsonb,
  unique (ayah_id, locale, translator)
);

create table if not exists public.quran_roots (
  id bigserial primary key,
  root_arabic text not null unique,
  transliteration text,
  core_meaning text,
  lane_lexicon_url text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.quran_words (
  id bigserial primary key,
  ayah_id integer not null references public.quran_ayahs(id) on delete cascade,
  position smallint not null,
  text_uthmani text not null,
  text_simple text,
  transliteration text,
  translation text,
  root_id bigint references public.quran_roots(id) on delete set null,
  lemma text,
  part_of_speech text,
  morphology jsonb not null default '{}'::jsonb,
  audio_url text,
  unique (ayah_id, position)
);

create table if not exists public.hadith_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  arabic_name text,
  compiler_scholar_id uuid references public.scholars(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  language text not null default 'en',
  description text,
  canonical_url text,
  license_name text
);

create table if not exists public.hadith_books (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.hadith_collections(id) on delete cascade,
  book_number integer,
  title text not null,
  arabic_title text,
  unique (collection_id, book_number)
);

create table if not exists public.hadith (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.hadith_collections(id) on delete cascade,
  book_id uuid references public.hadith_books(id) on delete set null,
  hadith_number text not null,
  arabic_text text,
  translation text not null,
  narrator text,
  chapter text,
  grade text,
  grader_scholar_id uuid references public.scholars(id) on delete set null,
  canonical_url text,
  metadata jsonb not null default '{}'::jsonb,
  unique (collection_id, hadith_number)
);

create table if not exists public.tafsir_works (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  scholar_id uuid references public.scholars(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  language text not null,
  methodology text,
  is_summary boolean not null default false,
  license_name text
);

create table if not exists public.tafsir_entries (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.tafsir_works(id) on delete cascade,
  start_ayah_id integer not null references public.quran_ayahs(id) on delete cascade,
  end_ayah_id integer references public.quran_ayahs(id) on delete cascade,
  text text not null,
  summary text,
  status public.content_status not null default 'draft',
  unique (work_id, start_ayah_id, end_ayah_id)
);

create table if not exists public.fatwa_cases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  question text not null,
  normalized_question text,
  topic_id uuid references public.topics(id) on delete set null,
  jurisdiction text,
  context_requirements jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fatwa_opinions (
  id uuid primary key default gen_random_uuid(),
  fatwa_case_id uuid not null references public.fatwa_cases(id) on delete cascade,
  label text not null,
  position_summary text not null,
  evidence_summary text,
  madhhab text,
  scholar_id uuid references public.scholars(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  conditions text,
  prevalence text check (prevalence in ('consensus', 'majority', 'minority', 'institutional', 'individual')),
  is_valid_difference boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  audience text[] not null default '{}',
  level public.content_level not null default 'beginner',
  locale text not null default 'en',
  estimated_weeks integer,
  status public.content_status not null default 'draft',
  primary_teacher_id uuid references public.scholars(id) on delete set null,
  certificate_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text,
  body_markdown text not null default '',
  content_type text not null default 'reading',
  estimated_minutes integer not null default 10,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  unique (module_id, slug)
);

create table if not exists public.course_enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'withdrawn')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, course_id)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent smallint not null default 0 check (progress_percent between 0 and 100),
  last_position jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  passing_score smallint not null default 70,
  attempts_allowed smallint,
  certificate_gate boolean not null default false
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  question_type text not null check (question_type in ('single_choice', 'multiple_choice', 'true_false', 'short_answer')),
  options jsonb not null default '[]'::jsonb,
  correct_answer jsonb not null,
  explanation text,
  references jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric(5,2),
  passed boolean,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_key text not null,
  collection_name text,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_key)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled note',
  body text not null default '',
  entity_type text,
  entity_key text,
  tags text[] not null default '{}',
  visibility text not null default 'private' check (visibility in ('private', 'household', 'teacher')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_key text not null,
  start_offset integer,
  end_offset integer,
  color text not null default 'yellow',
  selected_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.memorization_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  teacher_id uuid references auth.users(id) on delete set null,
  title text not null,
  start_ayah_id integer references public.quran_ayahs(id),
  end_ayah_id integer references public.quran_ayahs(id),
  target_date date,
  daily_new_ayahs smallint not null default 1,
  review_strategy jsonb not null default '{"intervals":[1,3,7,14,30]}'::jsonb,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.memorization_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  ayah_id integer not null references public.quran_ayahs(id) on delete cascade,
  plan_id uuid references public.memorization_plans(id) on delete set null,
  state text not null default 'learning' check (state in ('new', 'learning', 'memorized', 'weak', 'due_review')),
  strength numeric(4,3) not null default 0 check (strength between 0 and 1),
  mistake_count integer not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, ayah_id)
);

create table if not exists public.memorization_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ayah_id integer not null references public.quran_ayahs(id) on delete cascade,
  plan_id uuid references public.memorization_plans(id) on delete set null,
  quality smallint not null check (quality between 0 and 5),
  mistake_types text[] not null default '{}',
  duration_seconds integer,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.recitation_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  teacher_id uuid references auth.users(id) on delete set null,
  plan_id uuid references public.memorization_plans(id) on delete set null,
  start_ayah_id integer references public.quran_ayahs(id),
  end_ayah_id integer references public.quran_ayahs(id),
  audio_path text not null,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'reviewing', 'reviewed')),
  ai_feedback jsonb,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.recitation_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.recitation_submissions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  timestamp_seconds numeric(8,2),
  category text,
  comment text not null,
  severity text check (severity in ('note', 'minor', 'major')),
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  title text not null,
  category text not null,
  target numeric not null,
  unit text not null,
  cadence text not null check (cadence in ('daily', 'weekly', 'monthly', 'seasonal', 'one_time')),
  starts_on date not null default current_date,
  ends_on date,
  active boolean not null default true,
  check ((user_id is not null) <> (household_id is not null))
);

create table if not exists public.goal_logs (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value numeric not null default 1,
  note text,
  logged_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.masjids (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  name text not null,
  address text,
  city text,
  country text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  website_url text,
  phone text,
  prayer_times jsonb not null default '{}'::jsonb,
  services text[] not null default '{}',
  verification_status public.community_item_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  country text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  website_url text,
  phone text,
  halal_status text not null default 'unverified' check (halal_status in ('certified', 'owner_claimed', 'community_reported', 'unverified')),
  certification_source text,
  verification_status public.community_item_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  masjid_id uuid references public.masjids(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location_name text,
  registration_url text,
  audience text[] not null default '{}',
  status public.community_item_status not null default 'submitted',
  created_at timestamptz not null default now()
);

create table if not exists public.community_classes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  teacher_scholar_id uuid references public.scholars(id) on delete set null,
  title text not null,
  description text,
  schedule_text text,
  location_name text,
  online_url text,
  audience text[] not null default '{}',
  status public.community_item_status not null default 'submitted'
);

create table if not exists public.volunteer_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  schedule_text text,
  location_name text,
  signup_url text,
  skills text[] not null default '{}',
  status public.community_item_status not null default 'submitted'
);

create table if not exists public.teacher_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  scholar_id uuid references public.scholars(id) on delete set null,
  bio text,
  specialties text[] not null default '{}',
  languages text[] not null default '{}',
  accepting_students boolean not null default false,
  verification_status public.community_item_status not null default 'submitted'
);

create table if not exists public.organization_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

create table if not exists public.khutbahs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  speaker_scholar_id uuid references public.scholars(id) on delete set null,
  title text not null,
  summary text,
  transcript text,
  audio_url text,
  delivered_on date,
  topics text[] not null default '{}',
  status public.content_status not null default 'draft'
);

create table if not exists public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  scholar_id uuid references public.scholars(id) on delete set null,
  verdict public.review_verdict not null default 'pending',
  notes text,
  evidence_checked boolean not null default false,
  conflicts_checked boolean not null default false,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists content_reviews_entity_idx on public.content_reviews(entity_type, entity_id);

create table if not exists public.ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_ai_history (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.ai_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  confidence public.ai_confidence,
  scholarly_difference jsonb,
  retrieval_trace jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_key text not null,
  reason text not null,
  score numeric(8,5) not null default 0,
  context jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  dismissed_at timestamptz,
  opened_at timestamptz
);
create index if not exists recommendations_user_score_idx on public.recommendations(user_id, score desc);

create table if not exists public.content_localizations (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  locale text not null,
  title text,
  summary text,
  body text,
  translator text,
  status public.content_status not null default 'draft',
  unique (entity_type, entity_id, locale)
);

create table if not exists public.offline_content_packs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  locale text not null,
  version text not null,
  manifest jsonb not null,
  size_bytes bigint,
  checksum text,
  download_url text,
  published_at timestamptz
);

create table if not exists public.user_sync_mutations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_mutation_id text not null,
  entity_type text not null,
  entity_key text not null,
  operation text not null check (operation in ('insert', 'update', 'delete')),
  payload jsonb not null default '{}'::jsonb,
  client_created_at timestamptz not null,
  server_received_at timestamptz not null default now(),
  unique (user_id, client_mutation_id)
);

create table if not exists public.legacy_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  entry_type text not null check (entry_type in ('advice', 'reflection', 'dua', 'milestone', 'life_lesson')),
  recipients jsonb not null default '[]'::jsonb,
  release_condition jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.search_documents (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_key text not null,
  title text not null,
  summary text not null default '',
  body text not null default '',
  locale text not null default 'en',
  topic_slugs text[] not null default '{}',
  scholar_ids uuid[] not null default '{}',
  source_ids uuid[] not null default '{}',
  authority_weight numeric(5,3) not null default 0.5,
  review_status public.content_status not null default 'draft',
  url text not null,
  metadata jsonb not null default '{}'::jsonb,
  fts tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(body, '')), 'C')
  ) stored,
  embedding extensions.vector(1536),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_key, locale)
);
create index if not exists search_documents_fts_idx on public.search_documents using gin(fts);
create index if not exists search_documents_title_trgm_idx on public.search_documents using gin(title gin_trgm_ops);
create index if not exists search_documents_embedding_idx
  on public.search_documents using hnsw (embedding extensions.vector_cosine_ops)
  where embedding is not null;

create or replace function public.search_knowledge(
  search_query text,
  search_locale text default 'en',
  result_limit integer default 30,
  entity_types text[] default null
)
returns table (
  id uuid,
  entity_type text,
  entity_key text,
  title text,
  summary text,
  url text,
  review_status public.content_status,
  rank real,
  metadata jsonb
)
language sql stable
as $$
  select
    document.id,
    document.entity_type,
    document.entity_key,
    document.title,
    document.summary,
    document.url,
    document.review_status,
    (
      ts_rank(document.fts, websearch_to_tsquery('simple', search_query)) +
      document.authority_weight::real +
      similarity(document.title, search_query)
    )::real as rank,
    document.metadata
  from public.search_documents document
  where document.locale = search_locale
    and document.review_status in ('verified', 'published')
    and (entity_types is null or document.entity_type = any(entity_types))
    and (
      document.fts @@ websearch_to_tsquery('simple', search_query)
      or similarity(document.title, search_query) > 0.18
    )
  order by rank desc
  limit greatest(1, least(result_limit, 100));
$$;

create or replace function public.hybrid_search_knowledge(
  search_query text,
  query_embedding extensions.vector(1536),
  search_locale text default 'en',
  result_limit integer default 20,
  full_text_weight numeric default 1,
  semantic_weight numeric default 1
)
returns table (
  id uuid,
  entity_type text,
  entity_key text,
  title text,
  summary text,
  url text,
  score numeric,
  metadata jsonb
)
language sql stable
as $$
  with ranked as (
    select
      document.*,
      ts_rank(document.fts, websearch_to_tsquery('simple', search_query)) as text_score,
      case when document.embedding is null then 0 else 1 - (document.embedding <=> query_embedding) end as semantic_score
    from public.search_documents document
    where document.locale = search_locale
      and document.review_status in ('verified', 'published')
  )
  select
    ranked.id,
    ranked.entity_type,
    ranked.entity_key,
    ranked.title,
    ranked.summary,
    ranked.url,
    (
      ranked.text_score * full_text_weight +
      ranked.semantic_score * semantic_weight +
      ranked.authority_weight
    )::numeric as score,
    ranked.metadata
  from ranked
  order by score desc
  limit greatest(1, least(result_limit, 100));
$$;

create or replace function public.is_org_member(target_organization_id uuid, allowed_roles text[] default null)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and (allowed_roles is null or membership.role = any(allowed_roles))
  );
$$;

-- Public/reference data
alter table public.scholars enable row level security;
alter table public.sources enable row level security;
alter table public.topics enable row level security;
alter table public.articles enable row level security;
alter table public.quran_ayahs enable row level security;
alter table public.quran_translations enable row level security;
alter table public.quran_roots enable row level security;
alter table public.quran_words enable row level security;
alter table public.hadith_collections enable row level security;
alter table public.hadith_books enable row level security;
alter table public.hadith enable row level security;
alter table public.tafsir_works enable row level security;
alter table public.tafsir_entries enable row level security;
alter table public.fatwa_cases enable row level security;
alter table public.fatwa_opinions enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.search_documents enable row level security;

do $$ begin
  create policy "public_read_scholars" on public.scholars for select using (verified);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_sources" on public.sources for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_topics" on public.topics for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_articles" on public.articles for select using (status in ('verified', 'published'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_quran_ayahs" on public.quran_ayahs for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_quran_translations" on public.quran_translations for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_quran_roots" on public.quran_roots for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_quran_words" on public.quran_words for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_hadith_collections" on public.hadith_collections for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_hadith_books" on public.hadith_books for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_hadith" on public.hadith for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_tafsir_works" on public.tafsir_works for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_tafsir_entries" on public.tafsir_entries for select using (status in ('verified', 'published'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_fatwa_cases" on public.fatwa_cases for select using (status in ('verified', 'published'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_fatwa_opinions" on public.fatwa_opinions for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_courses" on public.courses for select using (status in ('verified', 'published'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_course_modules" on public.course_modules for select using (
    exists (select 1 from public.courses where courses.id = course_modules.course_id and courses.status in ('verified', 'published'))
  );
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_lessons" on public.lessons for select using (status in ('verified', 'published'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_search_documents" on public.search_documents for select using (review_status in ('verified', 'published'));
exception when duplicate_object then null; end $$;

-- User-owned data
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.organization_members enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notes enable row level security;
alter table public.highlights enable row level security;
alter table public.memorization_plans enable row level security;
alter table public.memorization_progress enable row level security;
alter table public.memorization_reviews enable row level security;
alter table public.recitation_submissions enable row level security;
alter table public.recitation_feedback enable row level security;
alter table public.goals enable row level security;
alter table public.goal_logs enable row level security;
alter table public.ai_threads enable row level security;
alter table public.user_ai_history enable row level security;
alter table public.recommendations enable row level security;
alter table public.user_sync_mutations enable row level security;
alter table public.legacy_entries enable row level security;
alter table public.content_reviews enable row level security;
alter table public.content_localizations enable row level security;
alter table public.offline_content_packs enable row level security;

do $$ begin create policy "households_owner_all" on public.households for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "household_members_owner_all" on public.household_members for all using (
  exists (select 1 from public.households where households.id = household_members.household_id and households.owner_id = auth.uid())
) with check (
  exists (select 1 from public.households where households.id = household_members.household_id and households.owner_id = auth.uid())
);
exception when duplicate_object then null; end $$;
do $$ begin create policy "organization_members_own_read" on public.organization_members for select using (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "enrollments_own" on public.course_enrollments for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "lesson_progress_own" on public.lesson_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "quiz_attempts_own" on public.quiz_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "bookmarks_own" on public.bookmarks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "notes_own" on public.notes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "highlights_own" on public.highlights for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "memorization_plans_student_teacher" on public.memorization_plans for select using (user_id = auth.uid() or teacher_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "memorization_plans_owner_write" on public.memorization_plans for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "memorization_progress_own" on public.memorization_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "memorization_reviews_own" on public.memorization_reviews for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "recitation_submissions_parties" on public.recitation_submissions for select using (student_id = auth.uid() or teacher_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "recitation_submissions_student_write" on public.recitation_submissions for insert with check (student_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "recitation_feedback_parties" on public.recitation_feedback for select using (
  reviewer_id = auth.uid() or exists (
    select 1 from public.recitation_submissions
    where recitation_submissions.id = recitation_feedback.submission_id
      and recitation_submissions.student_id = auth.uid()
  )
);
exception when duplicate_object then null; end $$;
do $$ begin create policy "recitation_feedback_reviewer_write" on public.recitation_feedback for all using (reviewer_id = auth.uid()) with check (reviewer_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "goals_owner" on public.goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "goal_logs_own" on public.goal_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "ai_threads_own" on public.ai_threads for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "ai_history_own" on public.user_ai_history for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "recommendations_own" on public.recommendations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "sync_mutations_own" on public.user_sync_mutations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "legacy_entries_own" on public.legacy_entries for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "content_reviews_reviewer_own" on public.content_reviews for all using (reviewer_id = auth.uid()) with check (reviewer_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin create policy "public_content_localizations" on public.content_localizations for select using (status in ('verified', 'published'));
exception when duplicate_object then null; end $$;
do $$ begin create policy "public_offline_packs" on public.offline_content_packs for select using (published_at is not null);
exception when duplicate_object then null; end $$;

-- Community read policies
alter table public.organizations enable row level security;
alter table public.masjids enable row level security;
alter table public.restaurants enable row level security;
alter table public.events enable row level security;
alter table public.community_classes enable row level security;
alter table public.volunteer_opportunities enable row level security;
alter table public.teacher_profiles enable row level security;
alter table public.khutbahs enable row level security;

do $$ begin create policy "public_verified_organizations" on public.organizations for select using (verification_status = 'verified');
exception when duplicate_object then null; end $$;
do $$ begin create policy "public_verified_masjids" on public.masjids for select using (verification_status = 'verified');
exception when duplicate_object then null; end $$;
do $$ begin create policy "public_verified_restaurants" on public.restaurants for select using (verification_status = 'verified');
exception when duplicate_object then null; end $$;
do $$ begin create policy "public_verified_events" on public.events for select using (status = 'verified');
exception when duplicate_object then null; end $$;
do $$ begin create policy "public_verified_classes" on public.community_classes for select using (status = 'verified');
exception when duplicate_object then null; end $$;
do $$ begin create policy "public_verified_volunteer" on public.volunteer_opportunities for select using (status = 'verified');
exception when duplicate_object then null; end $$;
do $$ begin create policy "public_verified_teachers" on public.teacher_profiles for select using (verification_status = 'verified');
exception when duplicate_object then null; end $$;
do $$ begin create policy "public_published_khutbahs" on public.khutbahs for select using (status in ('verified', 'published'));
exception when duplicate_object then null; end $$;
