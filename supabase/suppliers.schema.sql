-- Préparation uniquement : ce fichier n'a pas été exécuté sur un projet Supabase distant.
-- Les champs commerciaux restent vérifiables et aucune donnée fournisseur n'est seedée.
create table if not exists public.suppliers (
  id text primary key,
  name text not null,
  country text not null,
  city text not null,
  address text,
  phone text,
  whatsapp text,
  website text,
  categories text[] not null default '{}',
  brands text[] not null default '{}',
  products text[] not null default '{}',
  availability text not null check (availability in ('confirmed','to_confirm','unavailable','old')),
  delivery text not null check (delivery in ('confirmed_24h','pickup_24h','estimated','unknown')),
  usual_delivery_hours integer,
  served_areas text[] not null default '{}',
  pickup_available boolean,
  last_verified date,
  source text,
  validation text not null check (validation in ('verified','pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;
drop policy if exists "Public can read verified suppliers" on public.suppliers;
create policy "Public can read verified suppliers" on public.suppliers
  for select using (validation = 'verified');

-- Les insert/update/delete doivent être réservés à une interface d'administration
-- protégée ou à une migration contrôlée; ne jamais exposer service_role au frontend.
