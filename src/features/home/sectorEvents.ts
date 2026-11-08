import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/shared/supabase/client';

/**
 * Evento o aviso del barrio (tabla `sector_events`, solo lectura para la app). Sin ubicación exacta:
 * `placeLabel` es un texto de zona («Parque de Lince», «Local comunal»). Sin servidor se usan eventos de
 * demostración, siempre marcados como tales.
 */
export type SectorEvent = {
  id: string;
  kind: 'event' | 'notice';
  title: string;
  body: string;
  /** Cuándo empieza (ms desde 1970). */
  startsAt: number;
  placeLabel: string;
  /** Quién lo organiza o publica. Siempre visible. */
  source: string;
  isDemo: boolean;
};

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Un evento sigue «vigente» hasta 2 horas después de empezar. */
const GRACE_MS = 2 * HOUR;

/** Eventos vigentes, del más próximo al más lejano. */
export function upcomingEvents(events: SectorEvent[], now: number): SectorEvent[] {
  return events.filter((e) => e.startsAt + GRACE_MS >= now).sort((a, b) => a.startsAt - b.startsAt);
}

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
  const base = { isDemo: true, kind: 'event' as const };
  return [
    {
      ...base,
      id: 'demo-ev-1',
      title: 'Feria de emprendedores del barrio',
      body: 'Vecinos que venden comida, ropa y artesanías. Entrada libre.',
      startsAt: at(2, 16),
      placeLabel: `Parque de ${sectorName}`,
      source: 'Junta vecinal (demo)',
    },
    {
      ...base,
      id: 'demo-ev-2',
      title: 'Charla: qué hacer ante un sismo',
      body: 'Recomendaciones simples para tu familia y tu cuadra.',
      startsAt: at(4, 19),
      placeLabel: 'Local comunal',
      source: 'Defensa civil (demo)',
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
    },
  ];
}

type Row = {
  id: string;
  kind: SectorEvent['kind'];
  title: string;
  body: string;
  starts_at: string;
  place_label: string;
  source: string;
  is_demo: boolean;
};

export async function fetchSectorEvents(sectorId: string): Promise<SectorEvent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sector_events')
    .select('id,kind,title,body,starts_at,place_label,source,is_demo')
    .eq('sector_id', sectorId)
    .gte('starts_at', new Date(Date.now() - GRACE_MS).toISOString())
    .order('starts_at', { ascending: true })
    .limit(20)
    .overrideTypes<Row[]>();
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body,
    startsAt: new Date(r.starts_at).getTime(),
    placeLabel: r.place_label,
    source: r.source,
    isDemo: r.is_demo,
  }));
}

/**
 * Eventos del sector: los del servidor y, si no hay ninguno (o no hay servidor), los de demostración.
 * `now` viene de los datos para que la lista no «salte» en cada render.
 */
export function useSectorEvents(sectorId: string, sectorName: string) {
  return useQuery({
    queryKey: ['sector-events', sectorId],
    queryFn: async () => {
      const now = Date.now();
      const real = await fetchSectorEvents(sectorId);
      const events = real.length > 0 ? real : demoSectorEvents(now, sectorName);
      return { events: upcomingEvents(events, now), fetchedAt: now };
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}
