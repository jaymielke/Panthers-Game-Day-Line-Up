-- ============================================================
-- Panthers Tracker — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- Players (roster)
create table players (
  id uuid primary key default gen_random_uuid(),
  jersey text,
  name text not null,
  sort_order int not null default 0,
  photo_url text,
  created_at timestamptz default now()
);

-- Games (positions stored as jsonb keyed by player name, same shape the app already uses)
create table games (
  id serial primary key,
  game_num int not null unique,
  date text,
  opponent text,
  game_type text default 'Regular Season',
  players jsonb not null default '{}'::jsonb
);

-- Season batting totals, one row per player
create table batting_stats (
  player_name text primary key,
  jersey text,
  gp int default 0,
  ab int default 0,
  h int default 0,
  b1 int default 0,
  b2 int default 0,
  b3 int default 0,
  hr int default 0,
  rbi int default 0,
  r int default 0,
  so int default 0
);

-- MVP awards log
create table mvp_awards (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  context text,
  game_num int,
  practice_date text,
  game_label text,
  awarded_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- Only signed-in users can read or write. Add more coaches later
-- by inviting them in Authentication > Users — no policy changes needed.
-- ============================================================

alter table players enable row level security;
alter table games enable row level security;
alter table batting_stats enable row level security;
alter table mvp_awards enable row level security;

create policy "Authenticated full access" on players
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on games
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on batting_stats
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on mvp_awards
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Storage bucket for player photos
-- ============================================================

insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true)
on conflict (id) do nothing;

create policy "Public read player photos" on storage.objects
  for select using (bucket_id = 'player-photos');

create policy "Authenticated upload player photos" on storage.objects
  for insert with check (bucket_id = 'player-photos' and auth.role() = 'authenticated');

create policy "Authenticated update player photos" on storage.objects
  for update using (bucket_id = 'player-photos' and auth.role() = 'authenticated');

create policy "Authenticated delete player photos" on storage.objects
  for delete using (bucket_id = 'player-photos' and auth.role() = 'authenticated');
