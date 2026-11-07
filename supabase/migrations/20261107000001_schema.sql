-- Red Vecinal Solidaria — esquema inicial (etapa 10).
-- Principios: RLS en todas las tablas; sin columnas de ubicación precisa (solo sector);
-- el cliente usa auth anónima y nunca la service role; «received» no es «validado».

create table public.sectors (
  id text primary key,
  name text not null,
  city text not null,
  center_lat double precision not null,
  center_lng double precision not null,
  radius_km numeric not null default 2
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade, -- null = perfil ficticio de demo
  display_name text not null check (char_length(display_name) between 1 and 40),
  trust text not null default 'new' check (trust in ('new','verified','endorsed')),
  recommendations integer not null default 0 check (recommendations >= 0),
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key,
  author_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('offer','request')),
  category text not null check (category in ('tools','services','products','barter','mobility','care')),
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) <= 1000),
  sector_id text not null references public.sectors (id),
  price_label text check (char_length(price_label) <= 60),
  urgent boolean not null default false,
  available_now boolean not null default false,
  details jsonb not null default '[]'::jsonb,
  status text not null default 'active'
    check (status in ('draft','active','paused','in_coordination','completed','closed','expired')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index posts_sector_idx on public.posts (sector_id, status, created_at desc);
create index posts_author_idx on public.posts (author_id);

create table public.post_requests (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  requester_id uuid not null references auth.users (id) on delete cascade,
  message text not null check (char_length(message) <= 500),
  status text not null default 'received' check (status in ('received','accepted','declined')),
  created_at timestamptz not null default now()
);
create index post_requests_post_idx on public.post_requests (post_id);
create index post_requests_requester_idx on public.post_requests (requester_id);

create table public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (char_length(reason) <= 60),
  note text check (char_length(note) <= 500),
  status text not null default 'received' check (status in ('received','in_review','actioned','dismissed')),
  created_at timestamptz not null default now()
);
create index post_reports_post_idx on public.post_reports (post_id);
create index post_reports_reporter_idx on public.post_reports (reporter_id);

create table public.emergency_reports (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id text,
  kind text not null check (kind in ('help','incident')),
  category text not null,
  immediate_danger boolean not null default false,
  sector_id text not null references public.sectors (id),
  status text not null default 'received'
    check (status in ('received','in_review','validated','coordinated','resolved','duplicate','unverifiable','dismissed')),
  created_at timestamptz not null default now()
);
create index emergency_reports_user_idx on public.emergency_reports (user_id);
create index emergency_reports_sector_idx on public.emergency_reports (sector_id);

create table public.vulnerable_alerts (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  need text not null,
  basis text not null check (basis in ('present','authorized','observed')),
  sector_id text not null references public.sectors (id),
  status text not null default 'received'
    check (status in ('received','in_review','validated','coordinated','resolved','duplicate','unverifiable','dismissed')),
  created_at timestamptz not null default now()
);
create index vulnerable_alerts_user_idx on public.vulnerable_alerts (user_id);
create index vulnerable_alerts_sector_idx on public.vulnerable_alerts (sector_id);

create table public.resource_offers (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  resource text not null,
  sector_id text not null references public.sectors (id),
  stage text not null default 'offered'
    check (stage in ('offered','reserved','assigned','delivered','confirmed','cancelled')),
  created_at timestamptz not null default now()
);
create index resource_offers_user_idx on public.resource_offers (user_id);
create index resource_offers_sector_idx on public.resource_offers (sector_id);

-- Crea/actualiza el perfil público del usuario anónimo. La confianza nunca la fija el cliente.
create function public.upsert_profile(p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare pid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.profiles (user_id, display_name)
  values (auth.uid(), left(btrim(p_display_name), 40))
  on conflict (user_id) do update set display_name = excluded.display_name
  returning id into pid;
  return pid;
end $$;
revoke all on function public.upsert_profile(text) from public, anon;
grant execute on function public.upsert_profile(text) to authenticated;

alter table public.sectors enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_requests enable row level security;
alter table public.post_reports enable row level security;
alter table public.emergency_reports enable row level security;
alter table public.vulnerable_alerts enable row level security;
alter table public.resource_offers enable row level security;

create policy sectors_read on public.sectors for select to anon, authenticated using (true);
create policy profiles_read on public.profiles for select to anon, authenticated using (true);

create policy posts_read on public.posts for select to anon, authenticated
  using (
    (status = 'active' and expires_at > now())
    or exists (select 1 from public.profiles p where p.id = author_id and p.user_id = (select auth.uid()))
  );
create policy posts_insert on public.posts for insert to authenticated
  with check (
    is_demo = false
    and exists (select 1 from public.profiles p where p.id = author_id and p.user_id = (select auth.uid()))
  );
create policy posts_update_own on public.posts for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = author_id and p.user_id = (select auth.uid())))
  with check (
    is_demo = false
    and exists (select 1 from public.profiles p where p.id = author_id and p.user_id = (select auth.uid()))
  );

create policy requests_insert on public.post_requests for insert to authenticated
  with check (requester_id = (select auth.uid()));
create policy requests_read on public.post_requests for select to authenticated
  using (
    requester_id = (select auth.uid())
    or exists (
      select 1 from public.posts po join public.profiles pr on pr.id = po.author_id
      where po.id = post_id and pr.user_id = (select auth.uid())
    )
  );

create policy reports_insert on public.post_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
create policy reports_read on public.post_reports for select to authenticated
  using (reporter_id = (select auth.uid()));

create policy emergency_insert on public.emergency_reports for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'received');
create policy emergency_read on public.emergency_reports for select to authenticated
  using (user_id = (select auth.uid()));

create policy vulnerable_insert on public.vulnerable_alerts for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'received');
create policy vulnerable_read on public.vulnerable_alerts for select to authenticated
  using (user_id = (select auth.uid()));

create policy offers_insert on public.resource_offers for insert to authenticated
  with check (user_id = (select auth.uid()) and stage = 'offered');
create policy offers_read on public.resource_offers for select to authenticated
  using (user_id = (select auth.uid()));
create policy offers_update_own on public.resource_offers for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and stage in ('offered','cancelled'));
