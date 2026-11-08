import { canRsvp, groupEventsByWhen, mergeEvents, startsAtFrom } from './logic';
import type { SectorEvent } from './types';

// SPEC-046: eventos creados por vecinos con «Voy».
const NOW = new Date(2026, 10, 8, 10, 0, 0).getTime(); // domingo 8-nov-2026, 10:00 (hora local)
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const ev = (id: string, over: Partial<SectorEvent> = {}): SectorEvent => ({
  id,
  kind: 'event',
  title: id,
  body: '',
  startsAt: NOW + DAY,
  placeLabel: 'Parque',
  source: 'Rosa M.',
  isDemo: false,
  origin: 'neighbor',
  goingCount: 3,
  iAmGoing: false,
  isMine: false,
  ...over,
});

describe('groupEventsByWhen', () => {
  it('separa en Hoy, Esta semana y Más adelante, del más próximo al más lejano', () => {
    const groups = groupEventsByWhen(
      [
        ev('lejano', { startsAt: NOW + 9 * DAY }),
        ev('manana', { startsAt: NOW + DAY }),
        ev('hoy-tarde', { startsAt: NOW + 6 * HOUR }),
        ev('en-curso', { startsAt: NOW - HOUR }),
        ev('sabado', { startsAt: NOW + 6 * DAY }),
      ],
      NOW,
    );
    expect(groups.today.map((e) => e.id)).toEqual(['en-curso', 'hoy-tarde']);
    expect(groups.week.map((e) => e.id)).toEqual(['manana', 'sabado']);
    expect(groups.later.map((e) => e.id)).toEqual(['lejano']);
  });
});

describe('mergeEvents', () => {
  it('muestra los eventos que creé en el teléfono hasta que el servidor los tiene', () => {
    const mine = ev('nuevo', { isMine: true, goingCount: 0, syncStatus: 'local' });
    const before = mergeEvents({ server: [ev('a')], created: [mine], rsvps: {}, cancelledIds: [] });
    expect(before.map((e) => e.id)).toEqual(['a', 'nuevo']);
    expect(before[1].syncStatus).toBe('local');

    const after = mergeEvents({
      server: [ev('a'), ev('nuevo', { isMine: true })],
      created: [mine],
      rsvps: {},
      cancelledIds: [],
    });
    expect(after.filter((e) => e.id === 'nuevo')).toHaveLength(1);
    expect(after.find((e) => e.id === 'nuevo')?.syncStatus).toBeUndefined();
  });

  it('mi «Voy» pendiente se ve al instante pero NO cambia el conteo', () => {
    const [event] = mergeEvents({
      server: [ev('a', { goingCount: 3 })],
      created: [],
      rsvps: { a: { going: true, syncStatus: 'local' } },
      cancelledIds: [],
    });
    expect(event.iAmGoing).toBe(true);
    expect(event.goingCount).toBe(3);
    expect(event.myRsvp).toEqual({ going: true, syncStatus: 'local' });
  });

  it('cuando el servidor confirma, ya no se muestra como pendiente', () => {
    const [event] = mergeEvents({
      server: [ev('a', { goingCount: 4, iAmGoing: true })],
      created: [],
      rsvps: { a: { going: true, syncStatus: 'received' } },
      cancelledIds: [],
    });
    expect(event.iAmGoing).toBe(true);
    expect(event.myRsvp).toBeUndefined();
  });

  it('un evento que cancelé deja de verse', () => {
    expect(mergeEvents({ server: [ev('a', { isMine: true })], created: [], rsvps: {}, cancelledIds: ['a'] })).toEqual(
      [],
    );
  });

  it('ordena del más próximo al más lejano', () => {
    const out = mergeEvents({
      server: [ev('b', { startsAt: NOW + 2 * DAY }), ev('a')],
      created: [],
      rsvps: {},
      cancelledIds: [],
    });
    expect(out.map((e) => e.id)).toEqual(['a', 'b']);
  });
});

describe('canRsvp', () => {
  it('se puede marcar «Voy» en eventos vigentes de otros vecinos', () => {
    expect(canRsvp(ev('a'), NOW)).toBe(true);
  });

  it('no en el propio, ni en uno oficial (es abierto), ni en uno que ya pasó', () => {
    expect(canRsvp(ev('a', { isMine: true }), NOW)).toBe(false);
    expect(canRsvp(ev('a', { origin: 'official' }), NOW)).toBe(false);
    expect(canRsvp(ev('a', { startsAt: NOW - 3 * HOUR }), NOW)).toBe(false);
  });

  it('en la demostración sí, aunque sea oficial (queda solo en el teléfono)', () => {
    expect(canRsvp(ev('a', { origin: 'official', isDemo: true }), NOW)).toBe(true);
  });
});

describe('startsAtFrom', () => {
  it('arma la fecha local con el día elegido y la hora en punto', () => {
    const d = new Date(startsAtFrom(2, 19, NOW));
    expect([d.getDate(), d.getHours(), d.getMinutes()]).toEqual([10, 19, 0]);
  });
});
