-- Deen Companion Supabase schema
-- Run this in the Supabase SQL editor after creating a project.
-- Then apply supabase/migrations/202606240001_ecosystem_foundation.sql.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  type text not null check (type in ('dua', 'knowledge', 'hadith', 'tajweed', 'goal', 'calendar')),
  title text not null,
  category text,
  body jsonb not null default '{}'::jsonb,
  references jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'review', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_app_state enable row level security;
alter table public.content_items enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "state_select_own" on public.user_app_state
  for select using (auth.uid() = user_id);

create policy "state_insert_own" on public.user_app_state
  for insert with check (auth.uid() = user_id);

create policy "state_update_own" on public.user_app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "published_content_read" on public.content_items
  for select using (status = 'published');

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists user_app_state_touch_updated_at on public.user_app_state;
create trigger user_app_state_touch_updated_at
before update on public.user_app_state
for each row execute function public.touch_updated_at();

drop trigger if exists content_items_touch_updated_at on public.content_items;
create trigger content_items_touch_updated_at
before update on public.content_items
for each row execute function public.touch_updated_at();
