-- Mensajes y chat entre vecinos.
-- Principios: el chat NO existe hasta que el dueño de la publicación acepta la solicitud de contacto;
-- solo los dos participantes leen y escriben; sin teléfono ni dirección (solo nombre público);
-- el id del mensaje lo genera el cliente, así que reintentar un envío nunca lo duplica.
-- Las tablas no tienen políticas de escritura directa para conversaciones: todo pasa por funciones.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.post_requests (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  requester_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index conversations_owner_idx on public.conversations (owner_id);
create index conversations_requester_idx on public.conversations (requester_id);

create table public.messages (
  id uuid primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Solo los participantes ven su conversación.
create policy conversations_read on public.conversations for select to authenticated
  using (owner_id = (select auth.uid()) or requester_id = (select auth.uid()));

-- Solo los participantes leen y escriben mensajes, y solo como ellos mismos.
create policy messages_read on public.messages for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (select auth.uid()) in (c.owner_id, c.requester_id)
  ));
create policy messages_insert on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (select auth.uid()) in (c.owner_id, c.requester_id)
    )
  );

-- Solicitudes por responder que recibió quien consulta (dueño de la publicación). Sin datos de contacto.
create function public.pending_requests()
returns table (id uuid, post_id uuid, post_title text, message text, requester_name text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.id, po.id, po.title, r.message,
         coalesce((select p2.display_name from public.profiles p2 where p2.user_id = r.requester_id limit 1), 'Vecino'),
         r.created_at
  from public.post_requests r
  join public.posts po on po.id = r.post_id
  join public.profiles owner on owner.id = po.author_id
  where owner.user_id = auth.uid() and r.status = 'received'
  order by r.created_at desc
  limit 50;
$$;

-- El dueño acepta: se marca la solicitud y se abre la conversación (una sola por solicitud).
create function public.accept_request(p_request_id uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_post uuid;
  v_requester uuid;
  v_owner uuid;
  v_conv uuid;
begin
  select po.id, r.requester_id, owner.user_id
    into v_post, v_requester, v_owner
  from public.post_requests r
  join public.posts po on po.id = r.post_id
  join public.profiles owner on owner.id = po.author_id
  where r.id = p_request_id;

  if v_owner is null or v_owner is distinct from auth.uid() then
    raise exception 'No puedes responder esta solicitud';
  end if;

  update public.post_requests set status = 'accepted' where id = p_request_id;

  insert into public.conversations (request_id, post_id, owner_id, requester_id)
  values (p_request_id, v_post, v_owner, v_requester)
  on conflict (request_id) do update set request_id = excluded.request_id
  returning id into v_conv;

  return v_conv;
end;
$$;

create function public.decline_request(p_request_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.post_requests r set status = 'declined'
  from public.posts po
  join public.profiles owner on owner.id = po.author_id
  where r.id = p_request_id and po.id = r.post_id and owner.user_id = auth.uid();
  if not found then
    raise exception 'No puedes responder esta solicitud';
  end if;
end;
$$;

-- Bandeja: mis conversaciones con el nombre público de la otra persona y el último mensaje.
create function public.my_conversations()
returns table (id uuid, post_id uuid, post_title text, other_name text, last_body text, last_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.id, c.post_id, po.title,
         coalesce(
           case when c.owner_id = auth.uid()
             then (select p2.display_name from public.profiles p2 where p2.user_id = c.requester_id limit 1)
             else (select p3.display_name from public.profiles p3 where p3.user_id = c.owner_id limit 1)
           end, 'Vecino'),
         coalesce((select m.body from public.messages m where m.conversation_id = c.id order by m.created_at desc limit 1), ''),
         coalesce((select m.created_at from public.messages m where m.conversation_id = c.id order by m.created_at desc limit 1), c.created_at)
  from public.conversations c
  join public.posts po on po.id = c.post_id
  where auth.uid() in (c.owner_id, c.requester_id)
  order by 6 desc
  limit 50;
$$;

-- Solo personas con sesión (incluida la anónima) pueden usar estas funciones.
revoke all on function public.pending_requests() from public, anon;
revoke all on function public.accept_request(uuid) from public, anon;
revoke all on function public.decline_request(uuid) from public, anon;
revoke all on function public.my_conversations() from public, anon;
grant execute on function public.pending_requests() to authenticated;
grant execute on function public.accept_request(uuid) to authenticated;
grant execute on function public.decline_request(uuid) to authenticated;
grant execute on function public.my_conversations() to authenticated;
