create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  event_data jsonb not null default '{}'::jsonb,
  language text not null default 'fr',
  created_at timestamptz not null default now()
);

create index if not exists activity_events_created_at_idx on public.activity_events (created_at desc);
create index if not exists activity_events_name_idx on public.activity_events (event_name);

alter table public.activity_events enable row level security;

drop policy if exists "analytics_insert_own_or_anonymous" on public.activity_events;
create policy "analytics_insert_own_or_anonymous" on public.activity_events
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "analytics_admin_read" on public.activity_events;
create policy "analytics_admin_read" on public.activity_events
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Nettoyage optionnel à exécuter périodiquement pour rester dans le quota gratuit :
-- delete from public.activity_events where created_at < now() - interval '12 months';
