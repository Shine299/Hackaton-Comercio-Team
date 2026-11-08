-- SPEC-049 — Asistente con IA gratuita: límite de uso para no agotar los cupos gratuitos.
-- Solo se guarda CUÁNTOS mensajes hubo por persona y día; nunca el texto de las preguntas ni las respuestas.

create table public.assistant_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  count integer not null default 0 check (count >= 0),
  primary key (user_id, day)
);
alter table public.assistant_usage enable row level security; -- sin políticas: solo la función la toca

-- Suma un uso y dice si está permitido (≤ p_daily por persona y ≤ p_global en total, ese día).
-- Solo la ejecuta la Edge Function con la clave de servicio.
create function public.bump_assistant_usage(p_user uuid, p_daily integer, p_global integer)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_mine integer;
  v_total integer;
begin
  select coalesce(sum(count), 0) into v_total from public.assistant_usage where day = current_date;
  if v_total >= p_global then
    return false;
  end if;

  insert into public.assistant_usage (user_id, day, count) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set count = public.assistant_usage.count + 1
  returning count into v_mine;

  return v_mine <= p_daily;
end;
$$;

revoke all on function public.bump_assistant_usage(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.bump_assistant_usage(uuid, integer, integer) to service_role;
