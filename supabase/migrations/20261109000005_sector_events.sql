-- Eventos y avisos del barrio para la pestaña Comunidad.
-- Solo lectura para la app (sin políticas de escritura: los publica el personal autorizado desde el panel).
-- Sin ubicación exacta: `place_label` es solo un texto de zona.

create table public.sector_events (
  id uuid primary key default gen_random_uuid(),
  sector_id text not null references public.sectors (id),
  kind text not null default 'event' check (kind in ('event','notice')),
  title text not null check (char_length(title) between 3 and 120),
  body text not null default '' check (char_length(body) <= 400),
  starts_at timestamptz not null,
  place_label text not null check (char_length(place_label) between 2 and 80),
  source text not null check (char_length(source) between 2 and 80),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index sector_events_sector_idx on public.sector_events (sector_id, starts_at);

alter table public.sector_events enable row level security;

create policy sector_events_read on public.sector_events for select to anon, authenticated
  using (starts_at > now() - interval '2 hours');
