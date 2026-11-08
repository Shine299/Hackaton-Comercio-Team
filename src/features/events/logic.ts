import type { LocalRsvp, SectorEvent } from './types';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Un evento sigue «vigente» hasta 2 horas después de empezar (SPEC-028). */
const GRACE_MS = 2 * HOUR;

const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Eventos vigentes, del más próximo al más lejano. */
export function upcomingEvents(events: SectorEvent[], now: number): SectorEvent[] {
  return events.filter((e) => e.startsAt + GRACE_MS >= now).sort((a, b) => a.startsAt - b.startsAt);
}

const byStart = (a: SectorEvent, b: SectorEvent) => a.startsAt - b.startsAt || a.id.localeCompare(b.id);

/** Hoy (incluye lo que está en curso), los próximos 6 días y más adelante. */
export function groupEventsByWhen(events: SectorEvent[], now: number) {
  const today = startOfDay(now);
  const groups = { today: [] as SectorEvent[], week: [] as SectorEvent[], later: [] as SectorEvent[] };
  for (const event of [...events].sort(byStart)) {
    const days = Math.round((startOfDay(event.startsAt) - today) / DAY);
    if (days <= 0) groups.today.push(event);
    else if (days < 7) groups.week.push(event);
    else groups.later.push(event);
  }
  return groups;
}

type MergeInput = {
  server: SectorEvent[];
  /** Eventos creados en este teléfono (con su estado de envío). */
  created: SectorEvent[];
  /** Mi intención de «Voy» por id de evento. */
  rsvps: Record<string, LocalRsvp>;
  /** Eventos propios que cancelé (dejan de verse al instante). */
  cancelledIds: string[];
};

/**
 * Une lo del servidor con lo hecho en este teléfono. Mi «Voy» se ve al instante, pero el conteo es siempre el del
 * servidor: nunca se simula que alguien más lo recibió.
 */
export function mergeEvents({ server, created, rsvps, cancelledIds }: MergeInput): SectorEvent[] {
  const serverIds = new Set(server.map((e) => e.id));
  const cancelled = new Set(cancelledIds);
  return [...server, ...created.filter((e) => !serverIds.has(e.id))]
    .filter((e) => !cancelled.has(e.id))
    .map((e) => {
      const rsvp = rsvps[e.id];
      if (!rsvp) return e;
      return {
        ...e,
        iAmGoing: rsvp.going,
        myRsvp: rsvp.syncStatus === 'received' ? undefined : rsvp,
      };
    })
    .sort(byStart);
}

/** «Voy» solo en eventos vigentes de otros vecinos. Los oficiales son abiertos (sin registro), salvo en la demo. */
export function canRsvp(event: SectorEvent, now: number): boolean {
  if (event.isMine) return false;
  if (event.startsAt + GRACE_MS < now) return false;
  return event.origin === 'neighbor' || event.isDemo;
}

/** Fecha local: hoy + `dayOffset` días, a la hora `hour` en punto. */
export function startsAtFrom(dayOffset: number, hour: number, now: number): number {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
}
