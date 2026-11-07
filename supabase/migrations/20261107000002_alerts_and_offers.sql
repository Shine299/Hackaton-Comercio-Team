-- Alertas reales de sector (reemplazan a demoAlert) y ofertas con cantidad / entregas parciales.

-- Alertas de sector: las crea solo quien administra (service role o panel). Los clientes solo leen.
create table public.sector_alerts (
  id uuid primary key default gen_random_uuid(),
  sector_id text not null references public.sectors (id),
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) <= 600),
  severity text not null default 'warning' check (severity in ('info','warning','critical')),
  source text not null check (char_length(source) between 2 and 80), -- quién activó la alerta
  active boolean not null default true,
  created_at timestamptz not null default now(),
  ends_at timestamptz
);
create index sector_alerts_sector_idx on public.sector_alerts (sector_id, active);
alter table public.sector_alerts enable row level security;
create policy sector_alerts_read on public.sector_alerts for select to anon, authenticated
  using (active and (ends_at is null or ends_at > now()));

-- Ofertas: cantidad opcional y entregas parciales.
alter table public.resource_offers
  add column quantity integer check (quantity is null or quantity between 1 and 100000),
  add column delivered_quantity integer not null default 0 check (delivered_quantity >= 0),
  add constraint resource_offers_delivered_le_quantity
    check (quantity is null or delivered_quantity <= quantity);

-- Los clientes ya no actualizan la fila directamente: la etapa (reservado, asignado…) la coordinan
-- personas autorizadas. Quien ofrece solo puede cambiar cantidad, entregas parciales o cancelar.
drop policy offers_update_own on public.resource_offers;

create function public.update_my_offer(
  p_id uuid,
  p_quantity integer default null,
  p_delivered integer default null,
  p_cancel boolean default false
)
returns public.resource_offers
language plpgsql
security definer
set search_path = ''
as $$
declare r public.resource_offers;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update public.resource_offers o set
    quantity = coalesce(p_quantity, o.quantity),
    delivered_quantity = coalesce(p_delivered, o.delivered_quantity),
    stage = case when p_cancel and o.stage <> 'confirmed' then 'cancelled' else o.stage end
  where o.id = p_id and o.user_id = auth.uid() and o.stage <> 'cancelled'
  returning * into r;
  if not found then raise exception 'offer not found'; end if;
  return r;
end $$;
revoke all on function public.update_my_offer(uuid, integer, integer, boolean) from public, anon;
grant execute on function public.update_my_offer(uuid, integer, integer, boolean) to authenticated;
