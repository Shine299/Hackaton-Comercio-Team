import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { supabase } from '@/shared/supabase/client';

import { useEventsLocalStore } from './localStore';
import { mergeEvents, upcomingEvents } from './logic';
import type { SectorEvent } from './types';

export { upcomingEvents } from './logic';
export type { SectorEvent } from './types';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Un evento sigue «vigente» hasta 2 horas después de empezar. */
const GRACE_MS = 2 * HOUR;

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'] as const;

/** Partes de la fecha para el bloque de calendario («12», «NOV», «4:00 p. m.») y un texto relativo. */
export function eventDateParts(startsAt: number, now: number) {
  const date = new Date(startsAt);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${hour12}:${minutes} ${hours < 12 ? 'a. m.' : 'p. m.'}`;

  const startOfDay = (ms: number) => {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const days = Math.round((startOfDay(startsAt) - startOfDay(now)) / DAY);
  const when = days <= 0 ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} días`;

  return { day: String(date.getDate()), month: MONTHS[date.getMonth()], time, when };
}

/** Eventos ficticios para la demostración (sin servidor). Fechas relativas a «ahora». */
export function demoSectorEvents(now: number, sectorName: string): SectorEvent[] {
  const at = (days: number, hour: number) => {
    const d = new Date(now + days * DAY);
    d.setHours(hour, 0, 0, 0);
    return d.getTime();
  };
  const base = { isDemo: true, kind: 'event' as const, iAmGoing: false, isMine: false };
  return [
    {
      ...base,
      id: 'demo-ev-1',
      title: 'Feria de emprendedores del barrio',
      body: 'Vecinos que venden comida, ropa y artesanías. Entrada libre.',
      startsAt: at(2, 16),
      placeLabel: `Parque de ${sectorName}`,
      source: 'Junta vecinal (demo)',
      origin: 'official' as const,
      goingCount: 0,
    },
    {
      ...base,
      id: 'demo-ev-4',
      title: 'Clases de baile para adultos mayores',
      body: 'Música criolla y salsa, a nuestro ritmo. Trae agua y ropa cómoda.',
      startsAt: at(1, 17),
      placeLabel: `Local comunal de ${sectorName}`,
      source: 'Carmen R. (demo)',
      origin: 'neighbor' as const,
      venueKind: 'public_place' as const,
      goingCount: 12,
    },
    {
      ...base,
      id: 'demo-ev-5',
      title: 'Lonche de bienvenida a vecinos nuevos',
      body: 'Cada uno trae algo para compartir. Nos conocemos y armamos el grupo de la cuadra.',
      startsAt: at(3, 18),
      placeLabel: 'Cuadra 5 de la avenida principal',
      source: 'Luis P. (demo)',
      origin: 'neighbor' as const,
      venueKind: 'approx_zone' as const,
      goingCount: 7,
    },
    {
      ...base,
      id: 'demo-ev-2',
      title: 'Charla: qué hacer ante un sismo',
      body: 'Recomendaciones simples para tu familia y tu cuadra.',
      startsAt: at(4, 19),
      placeLabel: 'Local comunal',
      source: 'Defensa civil (demo)',
      origin: 'official' as const,
      goingCount: 0,
    },
    {
      ...base,
      id: 'demo-ev-3',
      kind: 'notice' as const,
      title: 'Jornada de limpieza de la quebrada',
      body: 'Trae guantes y bolsas. Se entregan refrigerios.',
      startsAt: at(6, 8),
      placeLabel: `Entrada de ${sectorName}`,
      source: 'Municipalidad (demo)',
      origin: 'official' as const,
      goingCount: 0,
    },
  ];
}

type OfficialRow = {
  id: string;
  kind: SectorEvent['kind'];
  title: string;
  body: string;
  starts_at: string;
  place_label: string;
  source: string;
  is_demo: boolean;
};

/** Fila de `sector_events_v2` (SPEC-046): oficiales y de vecinos, con conteo y sin ids de personas. */
type V2Row = OfficialRow & {
  origin: SectorEvent['origin'];
  venue_kind: SectorEvent['venueKind'] | null;
  going_count: number;
  i_am_going: boolean;
  is_mine: boolean;
};

const fromV2 = (r: V2Row): SectorEvent => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  body: r.body,
  startsAt: new Date(r.starts_at).getTime(),
  placeLabel: r.place_label,
  source: r.source,
  isDemo: r.is_demo,
  origin: r.origin,
  venueKind: r.venue_kind ?? undefined,
  goingCount: r.going_count,
  iAmGoing: r.i_am_going,
  isMine: r.is_mine,
});

/** Antes de aplicar la migración de SPEC-046: solo los oficiales, de la tabla (como en SPEC-028). */
async function fetchOfficialOnly(sectorId: string): Promise<SectorEvent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sector_events')
    .select('id,kind,title,body,starts_at,place_label,source,is_demo')
    .eq('sector_id', sectorId)
    .gte('starts_at', new Date(Date.now() - GRACE_MS).toISOString())
    .order('starts_at', { ascending: true })
    .limit(20)
    .overrideTypes<OfficialRow[]>();
  if (error || !data) return [];
  return data.map((r) =>
    fromV2({ ...r, origin: 'official', venue_kind: null, going_count: 0, i_am_going: false, is_mine: false }),
  );
}

export async function fetchSectorEvents(sectorId: string): Promise<SectorEvent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('sector_events_v2', { p_sector: sectorId });
  if (error || !data) return fetchOfficialOnly(sectorId);
  return (data as V2Row[]).map(fromV2);
}

/**
 * Eventos del sector: los del servidor (o, si no hay ninguno, los de demostración) más lo hecho en este teléfono
 * (eventos creados y mi «Voy» pendientes). `now` viene de los datos para que la lista no «salte» en cada render.
 */
export function useSectorEvents(sectorId: string, sectorName: string) {
  const query = useQuery({
    queryKey: ['sector-events', sectorId],
    queryFn: async () => {
      const now = Date.now();
      const real = await fetchSectorEvents(sectorId);
      const events = real.length > 0 ? real : demoSectorEvents(now, sectorName);
      return { events: upcomingEvents(events, now), fetchedAt: now };
    },
    staleTime: 10_000,
    // ≤ 10 s para que el organizador vea subir el conteo (SPEC-046, criterio 6).
    refetchInterval: 10_000,
  });

  const created = useEventsLocalStore((s) => s.created);
  const rsvps = useEventsLocalStore((s) => s.rsvps);
  const cancelledIds = useEventsLocalStore((s) => s.cancelledIds);
  const fetched = query.data;

  const data = useMemo(() => {
    if (!fetched) return undefined;
    const mine = upcomingEvents(created, fetched.fetchedAt);
    return {
      events: mergeEvents({ server: fetched.events, created: mine, rsvps, cancelledIds }),
      fetchedAt: fetched.fetchedAt,
    };
  }, [fetched, created, rsvps, cancelledIds]);

  return { ...query, data };
}
