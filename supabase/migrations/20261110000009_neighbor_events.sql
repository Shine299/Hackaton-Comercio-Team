-- SPEC-046 — Eventos creados por vecinos con «Voy».
-- Privacidad: nadie ve quién va (solo el número); ningún resultado trae ids de usuarios; el lugar es un nombre
-- público o una zona aproximada, nunca una dirección. Las tablas no tienen políticas: todo pasa por funciones.

create table public.events (
  id uuid primary key, -- lo genera el cliente: reintentar no duplica
  organizer_id uuid not null references auth.users (id) on delete cascade,
  sector_id text not null references public.sectors (id),
  title text not null check (char_length(title) between 3 and 120),
  body text not null default '' check (char_length(body) <= 400),
  starts_at timestamptz not null,
  venue_kind text not null check (venue_kind in ('public_place', 'approx_zone')),
  venue_name text not null check (char_length(venue_name) between 2 and 80),
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now()
);
create index events_sector_idx on public.events (sector_id, status, starts_at);
create index events_organizer_idx on public.events (organizer_id, created_at);

create table public.event_rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

-- Eventos vigentes del sector: oficiales (sector_events) + de vecinos, con conteo y sin ids de personas.
create function public.sector_events_v2(p_sector text)
returns table (
  id uuid, origin text, kind text, title text, body text, starts_at timestamptz, place_label text, source text,
  is_demo boolean, venue_kind text, going_count integer, i_am_going boolean, is_mine boolean
)
language sql stable security definer set search_path = public as $$
  select se.id, 'official', se.kind, se.title, se.body, se.starts_at, se.place_label, se.source,
         se.is_demo, null::text, 0, false, false
  from public.sector_events se
  where se.sector_id = p_sector and se.starts_at > now() - interval '2 hours'
  union all
  select e.id, 'neighbor', 'event', e.title, e.body, e.starts_at, e.venue_name,
         coalesce((select p.display_name from public.profiles p where p.user_id = e.organizer_id limit 1), 'Vecino'),
         false, e.venue_kind,
         (select count(*)::integer from public.event_rsvps r where r.event_id = e.id),
         exists (select 1 from public.event_rsvps r where r.event_id = e.id and r.user_id = auth.uid()),
         e.organizer_id = auth.uid()
  from public.events e
  where e.sector_id = p_sector and e.status = 'active' and e.starts_at > now() - interval '2 hours'
  order by 6
  limit 60;
$$;

-- Crear (idempotente por id). Fecha razonable y como máximo 5 eventos por persona por día.
create function public.create_event(
  p_id uuid, p_sector text, p_title text, p_body text, p_starts_at timestamptz, p_venue_kind text, p_venue_name text
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Necesitas una sesión para crear un evento';
  end if;
  if exists (select 1 from public.events where id = p_id) then
    return; -- reintento de la cola
  end if;
  if p_starts_at < now() - interval '1 hour' or p_starts_at > now() + interval '60 days' then
    raise exception 'La fecha del evento no es válida';
  end if;
  if (select count(*) from public.events
      where organizer_id = v_me and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Ya creaste 5 eventos hoy. Intenta mañana.';
  end if;

  insert into public.events (id, organizer_id, sector_id, title, body, starts_at, venue_kind, venue_name)
  values (p_id, v_me, p_sector, trim(p_title), coalesce(p_body, ''), p_starts_at, p_venue_kind, trim(p_venue_name));
end;
$$;

-- «Voy» / «Ya no voy». No en eventos cancelados ni en los propios.
create function public.rsvp_event(p_event_id uuid, p_going boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_organizer uuid;
  v_status text;
begin
  select organizer_id, status into v_organizer, v_status from public.events where id = p_event_id;
  if v_organizer is null then
    raise exception 'Evento no encontrado';
  end if;
  if v_organizer = v_me then
    raise exception 'Es tu evento';
  end if;
  if v_status <> 'active' then
    raise exception 'Este evento fue cancelado';
  end if;

  if p_going then
    insert into public.event_rsvps (event_id, user_id) values (p_event_id, v_me) on conflict do nothing;
  else
    delete from public.event_rsvps where event_id = p_event_id and user_id = v_me;
  end if;
end;
$$;

create function public.cancel_my_event(p_event_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.events set status = 'cancelled' where id = p_event_id and organizer_id = auth.uid();
  if not found then
    raise exception 'No puedes cancelar este evento';
  end if;
end;
$$;

revoke all on function public.sector_events_v2(text) from public;
revoke all on function public.create_event(uuid, text, text, text, timestamptz, text, text) from public, anon;
revoke all on function public.rsvp_event(uuid, boolean) from public, anon;
revoke all on function public.cancel_my_event(uuid) from public, anon;
-- Ver eventos no requiere cuenta (anon); crear, ir y cancelar sí.
grant execute on function public.sector_events_v2(text) to anon, authenticated;
grant execute on function public.create_event(uuid, text, text, text, timestamptz, text, text) to authenticated;
grant execute on function public.rsvp_event(uuid, boolean) to authenticated;
grant execute on function public.cancel_my_event(uuid) to authenticated;
