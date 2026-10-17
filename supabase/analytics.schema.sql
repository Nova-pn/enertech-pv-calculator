create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null check (char_length(session_id) between 10 and 100),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null check (event_name in ('page_view','sizing_started','sizing_completed','pdf_generated','project_saved','supplier_viewed','supplier_whatsapp_clicked','supplier_phone_clicked','catalog_item_selected')),
  event_data jsonb not null default '{}'::jsonb check (pg_column_size(event_data) <= 8192),
  language text not null default 'fr' check (language in ('fr','en','es','ar','sw')),
  created_at timestamptz not null default now()
);

create index if not exists activity_events_created_at_idx on public.activity_events (created_at desc);
create index if not exists activity_events_name_idx on public.activity_events (event_name);

alter table public.activity_events enable row level security;
drop policy if exists "analytics_insert_own_or_anonymous" on public.activity_events;
create policy "analytics_insert_own_or_anonymous" on public.activity_events for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
drop policy if exists "analytics_admin_read" on public.activity_events;
create policy "analytics_admin_read" on public.activity_events for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Réduire la taille de la base gratuite si nécessaire :
-- delete from public.activity_events where created_at < now() - interval '12 months';
