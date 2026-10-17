create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  state jsonb not null check (pg_column_size(state) <= 1048576),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists projects_user_updated_idx on public.projects(user_id, updated_at desc);
alter table public.projects enable row level security;

drop policy if exists "Users can read their own projects" on public.projects;
create policy "Users can read their own projects" on public.projects for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own projects" on public.projects;
create policy "Users can insert their own projects" on public.projects for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update their own projects" on public.projects;
create policy "Users can update their own projects" on public.projects for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own projects" on public.projects;
create policy "Users can delete their own projects" on public.projects for delete to authenticated using (auth.uid() = user_id);
