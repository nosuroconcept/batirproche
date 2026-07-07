-- ============================================================
-- BatirProche — schéma initial
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists cube;
create extension if not exists earthdistance;

-- ------------------------------------------------------------
-- Métiers (référentiel)
-- ------------------------------------------------------------
create table trades (
  id serial primary key,
  slug text unique not null,
  label_fr text not null,
  icon text not null default 'ti-tool'
);

insert into trades (slug, label_fr, icon) values
  ('macon', 'Maçon', 'ti-brick'),
  ('electricien', 'Électricien', 'ti-bolt'),
  ('plombier', 'Plombier', 'ti-droplet'),
  ('carreleur', 'Carreleur', 'ti-grid-dots'),
  ('menuisier', 'Menuisier', 'ti-axe'),
  ('peintre', 'Peintre', 'ti-brush'),
  ('couvreur', 'Couvreur', 'ti-home'),
  ('chauffagiste', 'Chauffagiste', 'ti-flame'),
  ('paysagiste', 'Paysagiste', 'ti-plant-2'),
  ('serrurier', 'Serrurier', 'ti-key');

-- ------------------------------------------------------------
-- Utilisateurs (étend auth.users de Supabase)
-- role: 'client' | 'artisan'
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('client', 'artisan')),
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Fiches artisan (espace personnel)
-- ------------------------------------------------------------
create table artisans (
  id uuid primary key references profiles(id) on delete cascade,
  company_name text not null,
  siret text,
  trade_id int not null references trades(id),
  description text,
  address text not null,
  city text not null,
  postal_code text not null,
  lat double precision not null,
  lng double precision not null,
  service_radius_km int not null default 20,
  price_range text check (price_range in ('€', '€€', '€€€')),
  verified boolean not null default false,
  is_online boolean not null default false,
  last_seen_at timestamptz default now(),
  created_at timestamptz not null default now()
);

-- Index géographique pour les recherches "plus proche de moi"
create index artisans_geo_idx on artisans using gist (ll_to_earth(lat, lng));
create index artisans_trade_idx on artisans (trade_id);

-- ------------------------------------------------------------
-- Photos de réalisations
-- ------------------------------------------------------------
create table artisan_photos (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid not null references artisans(id) on delete cascade,
  url text not null,
  caption text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Avis clients
-- ------------------------------------------------------------
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid not null references artisans(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (artisan_id, client_id)
);

-- ------------------------------------------------------------
-- Messagerie
-- ------------------------------------------------------------
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid not null references artisans(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (artisan_id, client_id)
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Statistiques de visibilité (vues de fiche, clics contact)
-- ------------------------------------------------------------
create table artisan_stats_events (
  id uuid primary key default uuid_generate_v4(),
  artisan_id uuid not null references artisans(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'contact_click', 'phone_click')),
  created_at timestamptz not null default now()
);
create index artisan_stats_events_idx on artisan_stats_events (artisan_id, event_type, created_at);

-- ------------------------------------------------------------
-- Fonction : recherche des artisans les plus proches
-- Utilise earthdistance pour un calcul de distance en km
-- ------------------------------------------------------------
create or replace function nearest_artisans(
  search_lat double precision,
  search_lng double precision,
  trade_slug text default null,
  max_results int default 30
)
returns table (
  id uuid,
  company_name text,
  trade_label text,
  city text,
  lat double precision,
  lng double precision,
  distance_km double precision,
  avg_rating numeric,
  review_count bigint,
  verified boolean,
  is_online boolean
)
language sql stable
as $$
  select
    a.id,
    a.company_name,
    t.label_fr as trade_label,
    a.city,
    a.lat,
    a.lng,
    round((earth_distance(ll_to_earth(search_lat, search_lng), ll_to_earth(a.lat, a.lng)) / 1000)::numeric, 1) as distance_km,
    coalesce(round(avg(r.rating)::numeric, 1), 0) as avg_rating,
    count(r.id) as review_count,
    a.verified,
    a.is_online
  from artisans a
  join trades t on t.id = a.trade_id
  left join reviews r on r.artisan_id = a.id
  where (trade_slug is null or t.slug = trade_slug)
    and earth_distance(ll_to_earth(search_lat, search_lng), ll_to_earth(a.lat, a.lng)) / 1000 <= a.service_radius_km
  group by a.id, t.label_fr
  order by distance_km asc
  limit max_results;
$$;

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table artisans enable row level security;
alter table artisan_photos enable row level security;
alter table reviews enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table artisan_stats_events enable row level security;

create policy "Profils publics en lecture" on profiles for select using (true);
create policy "Un utilisateur modifie son propre profil" on profiles for update using (auth.uid() = id);

create policy "Fiches artisan publiques en lecture" on artisans for select using (true);
create policy "Un artisan modifie sa propre fiche" on artisans for update using (auth.uid() = id);
create policy "Un artisan crée sa propre fiche" on artisans for insert with check (auth.uid() = id);

create policy "Photos publiques en lecture" on artisan_photos for select using (true);
create policy "Un artisan gère ses propres photos" on artisan_photos for all using (
  auth.uid() = (select id from artisans where id = artisan_id)
);

create policy "Avis publics en lecture" on reviews for select using (true);
create policy "Un client publie un avis" on reviews for insert with check (auth.uid() = client_id);

create policy "Participants voient leur conversation" on conversations for select using (
  auth.uid() = client_id or auth.uid() = artisan_id
);
create policy "Un client démarre une conversation" on conversations for insert with check (auth.uid() = client_id);

create policy "Participants voient leurs messages" on messages for select using (
  auth.uid() in (
    select client_id from conversations where id = conversation_id
    union
    select artisan_id from conversations where id = conversation_id
  )
);
create policy "Participants envoient des messages" on messages for insert with check (
  auth.uid() = sender_id
);

create policy "Un artisan voit ses propres stats" on artisan_stats_events for select using (auth.uid() = artisan_id);
create policy "Événement de stat créé librement" on artisan_stats_events for insert with check (true);
