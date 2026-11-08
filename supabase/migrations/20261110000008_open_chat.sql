-- SPEC-045 — Chat directo desde el Marketplace.
-- «Escribir» abre la conversación sin solicitud previa. A cambio: bloquear, reportar mensajes y límite de envío.
-- Las conversaciones creadas con accept_request (SPEC-025) se conservan; esas funciones siguen para clientes viejos.
-- Ninguna función devuelve ids de usuarios ni mensajes de terceros.

-- 1) Las conversaciones ya no necesitan una solicitud aceptada.
alter table public.conversations alter column request_id drop not null;
create index if not exists conversations_post_requester_idx on public.conversations (post_id, requester_id);

-- 2) Bloqueos (solo por funciones: sin políticas de lectura ni escritura directa).
create table public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table public.blocks enable row level security;

create function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;
-- La política de `messages` la evalúa con el rol de quien escribe: `authenticated` necesita ejecutarla.
-- Solo responde sí/no para dos ids; no expone quién bloqueó a quién ni listas.
revoke all on function public.is_blocked_between(uuid, uuid) from public, anon;
grant execute on function public.is_blocked_between(uuid, uuid) to authenticated;

-- 3) Reportes de mensajes (solo por funciones).
create table public.message_reports (
  id uuid primary key,
  message_id uuid not null references public.messages (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text not null default 'other' check (char_length(reason) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (message_id, reporter_id)
);
alter table public.message_reports enable row level security;

-- 4) Escribir: además de participar, que no haya bloqueo entre los dos.
drop policy messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (select auth.uid()) in (c.owner_id, c.requester_id)
        and not public.is_blocked_between(c.owner_id, c.requester_id)
    )
  );

-- 5) Límite: 30 mensajes por persona por minuto.
create function public.messages_rate_limit()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.messages
      where sender_id = new.sender_id and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'Demasiados mensajes seguidos. Espera un momento.';
  end if;
  return new;
end;
$$;
create trigger messages_rate_limit before insert on public.messages
  for each row execute function public.messages_rate_limit();

-- 6) Abrir (o reutilizar) la conversación de quien llama con el dueño de una publicación.
create function public.start_conversation(p_post_id uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_owner uuid;
  v_status text;
  v_conv uuid;
begin
  if v_me is null then
    raise exception 'Necesitas una sesión para escribir';
  end if;

  select owner.user_id, po.status into v_owner, v_status
  from public.posts po
  join public.profiles owner on owner.id = po.author_id
  where po.id = p_post_id;

  if not found then
    raise exception 'Publicación no encontrada';
  end if;
  if v_owner is null then
    raise exception 'Esta publicación es de demostración';
  end if;
  if v_owner = v_me then
    raise exception 'No puedes escribirte a ti mismo';
  end if;
  if v_status <> 'active' then
    raise exception 'Esta publicación ya no está activa';
  end if;
  if public.is_blocked_between(v_owner, v_me) then
    raise exception 'No puedes escribir a este vecino';
  end if;

  -- Un candado por (publicación, persona): dos toques seguidos no crean dos conversaciones.
  perform pg_advisory_xact_lock(hashtextextended(p_post_id::text || ':' || v_me::text, 0));

  select c.id into v_conv
  from public.conversations c
  where c.post_id = p_post_id and c.requester_id = v_me
  order by c.created_at
  limit 1;

  if v_conv is null then
    insert into public.conversations (post_id, owner_id, requester_id)
    values (p_post_id, v_owner, v_me)
    returning id into v_conv;
  end if;

  return v_conv;
end;
$$;

-- 7) Bloquear a la otra persona de una conversación en la que participo.
create function public.block_in_conversation(p_conversation_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_other uuid;
begin
  select case when c.owner_id = v_me then c.requester_id else c.owner_id end into v_other
  from public.conversations c
  where c.id = p_conversation_id and v_me in (c.owner_id, c.requester_id);

  if v_other is null then
    raise exception 'No participas en esta conversación';
  end if;

  insert into public.blocks (blocker_id, blocked_id) values (v_me, v_other)
  on conflict do nothing;
end;
$$;

-- 8) Reportar un mensaje de la otra persona (idempotente por el id del cliente).
create function public.report_message(p_id uuid, p_message_id uuid, p_reason text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_sender uuid;
begin
  select m.sender_id into v_sender
  from public.messages m
  join public.conversations c on c.id = m.conversation_id
  where m.id = p_message_id and v_me in (c.owner_id, c.requester_id);

  if v_sender is null then
    raise exception 'Mensaje no encontrado';
  end if;
  if v_sender = v_me then
    raise exception 'No puedes reportar tu propio mensaje';
  end if;

  insert into public.message_reports (id, message_id, reporter_id, reason)
  values (p_id, p_message_id, v_me, coalesce(nullif(p_reason, ''), 'other'))
  on conflict do nothing;
end;
$$;

-- 9) Bandeja: se agrega `blocked` (hay bloqueo en cualquier sentido). Sin ids de usuarios.
drop function public.my_conversations();
create function public.my_conversations()
returns table (id uuid, post_id uuid, post_title text, other_name text, last_body text, last_at timestamptz, blocked boolean)
language sql stable security definer set search_path = public as $$
  select c.id, c.post_id, po.title,
         coalesce(
           case when c.owner_id = auth.uid()
             then (select p2.display_name from public.profiles p2 where p2.user_id = c.requester_id limit 1)
             else (select p3.display_name from public.profiles p3 where p3.user_id = c.owner_id limit 1)
           end, 'Vecino'),
         coalesce((select m.body from public.messages m where m.conversation_id = c.id order by m.created_at desc limit 1), ''),
         coalesce((select m.created_at from public.messages m where m.conversation_id = c.id order by m.created_at desc limit 1), c.created_at),
         public.is_blocked_between(c.owner_id, c.requester_id)
  from public.conversations c
  join public.posts po on po.id = c.post_id
  where auth.uid() in (c.owner_id, c.requester_id)
  order by 6 desc
  limit 50;
$$;

revoke all on function public.start_conversation(uuid) from public, anon;
revoke all on function public.block_in_conversation(uuid) from public, anon;
revoke all on function public.report_message(uuid, uuid, text) from public, anon;
revoke all on function public.my_conversations() from public, anon;
revoke all on function public.messages_rate_limit() from public, anon, authenticated;
grant execute on function public.start_conversation(uuid) to authenticated;
grant execute on function public.block_in_conversation(uuid) to authenticated;
grant execute on function public.report_message(uuid, uuid, text) to authenticated;
grant execute on function public.my_conversations() to authenticated;
