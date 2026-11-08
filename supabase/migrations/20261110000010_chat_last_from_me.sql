-- SPEC-048 — Chat sin leer: la bandeja necesita saber si el último mensaje lo escribió quien consulta, para no contar
-- (ni notificar) sus propios mensajes. Migración nueva: no se edita la 08 por si ya está aplicada.
-- Sigue sin devolver ids de usuarios.

drop function public.my_conversations();
create function public.my_conversations()
returns table (
  id uuid, post_id uuid, post_title text, other_name text, last_body text, last_at timestamptz, blocked boolean,
  last_from_me boolean
)
language sql stable security definer set search_path = public as $$
  select c.id, c.post_id, po.title,
         coalesce(
           case when c.owner_id = auth.uid()
             then (select p2.display_name from public.profiles p2 where p2.user_id = c.requester_id limit 1)
             else (select p3.display_name from public.profiles p3 where p3.user_id = c.owner_id limit 1)
           end, 'Vecino'),
         coalesce(last.body, ''),
         coalesce(last.created_at, c.created_at),
         public.is_blocked_between(c.owner_id, c.requester_id),
         coalesce(last.sender_id = auth.uid(), false)
  from public.conversations c
  join public.posts po on po.id = c.post_id
  left join lateral (
    select m.body, m.created_at, m.sender_id
    from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) last on true
  where auth.uid() in (c.owner_id, c.requester_id)
  order by 6 desc
  limit 50;
$$;

revoke all on function public.my_conversations() from public, anon;
grant execute on function public.my_conversations() to authenticated;
