-- Tablero compartido del sector, «Voy a ayudar» y emprendimientos.
-- Principio: las tablas de reportes siguen siendo privadas (RLS = solo su autor). El tablero público
-- se lee con una función que devuelve SOLO lo no identificable: tipo, sector, estado, hora y cuántos
-- vecinos van en camino. Nunca user_id, detalle, diagnóstico ni foto (esos no salen del teléfono).

-- Respuestas de vecinos a un aviso del tablero (alerta por vecino vulnerable o pedido de ayuda).
create table public.board_responses (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null,            -- id de vulnerable_alerts o emergency_reports
  responder_id uuid not null references auth.users (id) on delete cascade,
  responder_name text not null check (char_length(responder_name) between 1 and 40),
  status text not null default 'on_the_way' check (status in ('on_the_way','arrived','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (target_id, responder_id)
);
create index board_responses_target_idx on public.board_responses (target_id);
alter table public.board_responses enable row level security;
-- Sin políticas de lectura/escritura directas: todo pasa por las funciones de abajo.

-- Tablero del sector (últimas 24 h, sin cerrados). `mine` = lo creó quien consulta.
-- Solo al autor se le devuelven los nombres públicos de quienes van en camino.
create function public.sector_board(p_sector_id text)
returns table (
  id uuid,
  source text,          -- 'vulnerable' | 'help' | 'incident'
  category text,
  immediate_danger boolean,
  status text,
  created_at timestamptz,
  responders integer,
  arrived integer,
  i_respond text,       -- estado de mi respuesta o null
  mine boolean,
  responder_names text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  with items as (
    select v.id, 'vulnerable'::text as source, v.need as category, false as immediate_danger,
           v.status, v.created_at, v.user_id
    from public.vulnerable_alerts v
    where v.sector_id = p_sector_id
    union all
    select e.id, e.kind, e.category, e.immediate_danger, e.status, e.created_at, e.user_id
    from public.emergency_reports e
    where e.sector_id = p_sector_id
  )
  select
    i.id, i.source, i.category, i.immediate_danger, i.status, i.created_at,
    (select count(*)::int from public.board_responses r where r.target_id = i.id and r.status <> 'withdrawn'),
    (select count(*)::int from public.board_responses r where r.target_id = i.id and r.status = 'arrived'),
    (select r.status from public.board_responses r where r.target_id = i.id and r.responder_id = auth.uid()),
    (i.user_id = auth.uid()),
    case when i.user_id = auth.uid() then
      array(select r.responder_name from public.board_responses r
            where r.target_id = i.id and r.status <> 'withdrawn' order by r.created_at)
    else null end
  from items i
  where i.created_at > now() - interval '24 hours'
    and (i.status not in ('duplicate','unverifiable','dismissed')
         or i.user_id = auth.uid())
  order by i.created_at desc
  limit 50;
$$;
revoke all on function public.sector_board(text) from public;
grant execute on function public.sector_board(text) to anon, authenticated;

-- «Voy a ayudar» / «Ya llegué» / «Ya no puedo ir». Nadie responde a su propio aviso.
create function public.respond_to_board_item(p_target_id uuid, p_status text, p_display_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare owner uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_status not in ('on_the_way','arrived','withdrawn') then raise exception 'invalid status'; end if;
  select user_id into owner from public.vulnerable_alerts where id = p_target_id;
  if owner is null then
    select user_id into owner from public.emergency_reports where id = p_target_id and kind = 'help';
  end if;
  if owner is null then raise exception 'item not found'; end if;
  if owner = auth.uid() then raise exception 'cannot respond to own item'; end if;
  insert into public.board_responses (target_id, responder_id, responder_name, status)
  values (p_target_id, auth.uid(), left(coalesce(nullif(btrim(p_display_name), ''), 'Un vecino'), 40), p_status)
  on conflict (target_id, responder_id)
  do update set status = excluded.status, responder_name = excluded.responder_name, updated_at = now();
  return p_status;
end $$;
revoke all on function public.respond_to_board_item(uuid, text, text) from public, anon;
grant execute on function public.respond_to_board_item(uuid, text, text) to authenticated;

-- Quien avisó confirma que la persona ya fue atendida (confirmación de la otra parte).
create function public.resolve_my_board_item(p_target_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update public.vulnerable_alerts set status = 'resolved'
    where id = p_target_id and user_id = auth.uid();
  if not found then
    update public.emergency_reports set status = 'resolved'
      where id = p_target_id and user_id = auth.uid() and kind = 'help';
    if not found then raise exception 'item not found'; end if;
  end if;
  return 'resolved';
end $$;
revoke all on function public.resolve_my_board_item(uuid) from public, anon;
grant execute on function public.resolve_my_board_item(uuid) to authenticated;

-- Impacto del sector hoy: ayudas atendidas y vecinos que respondieron (solo conteos).
create function public.sector_impact(p_sector_id text)
returns table (resolved_today integer, responders_today integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*)::int from (
       select id from public.vulnerable_alerts
        where sector_id = p_sector_id and status = 'resolved' and created_at > now() - interval '24 hours'
       union all
       select id from public.emergency_reports
        where sector_id = p_sector_id and status = 'resolved' and created_at > now() - interval '24 hours'
     ) t),
    (select count(distinct r.responder_id)::int
       from public.board_responses r
       where r.status <> 'withdrawn' and r.created_at > now() - interval '24 hours'
         and (exists (select 1 from public.vulnerable_alerts v where v.id = r.target_id and v.sector_id = p_sector_id)
           or exists (select 1 from public.emergency_reports e where e.id = r.target_id and e.sector_id = p_sector_id)));
$$;
revoke all on function public.sector_impact(text) from public;
grant execute on function public.sector_impact(text) to anon, authenticated;

-- Emprendimientos del barrio: nueva categoría de publicación.
alter table public.posts drop constraint posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in ('tools','services','products','barter','mobility','care','business'));
