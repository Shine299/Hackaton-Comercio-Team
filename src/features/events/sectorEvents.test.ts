import { demoSectorEvents, eventDateParts, upcomingEvents, type SectorEvent } from './sectorEvents';

// Con `.env` presente, el cliente real de Supabase abre SQLite al cargar y Jest no tiene el módulo nativo.
jest.mock('@/shared/supabase/client', () => ({ supabase: null }));
// El store local trae la cola de envío (y con ella módulos nativos); aquí solo se prueba lógica pura.
jest.mock('./localStore', () => ({ useEventsLocalStore: jest.fn() }));

const NOW = new Date(2026, 10, 8, 10, 0, 0).getTime(); // 8-nov-2026, 10:00 (hora local)
const HOUR = 3_600_000;

const ev = (id: string, startsAt: number): SectorEvent => ({
  id,
  kind: 'event',
  title: id,
  body: '',
  startsAt,
  placeLabel: 'Zona',
  source: 'Prueba',
  isDemo: true,
  origin: 'official',
  goingCount: 0,
  iAmGoing: false,
  isMine: false,
});

describe('upcomingEvents', () => {
  it('ordena del más próximo al más lejano', () => {
    const out = upcomingEvents([ev('b', NOW + 5 * HOUR), ev('a', NOW + HOUR), ev('c', NOW + 30 * HOUR)], NOW);
    expect(out.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('quita los que ya pasaron hace más de 2 horas, pero conserva el que está en curso', () => {
    const out = upcomingEvents(
      [ev('viejo', NOW - 3 * HOUR), ev('en-curso', NOW - HOUR), ev('futuro', NOW + HOUR)],
      NOW,
    );
    expect(out.map((e) => e.id)).toEqual(['en-curso', 'futuro']);
  });
});

describe('eventDateParts', () => {
  it('formatea día, mes y hora en 12 horas', () => {
    const parts = eventDateParts(new Date(2026, 10, 12, 16, 5).getTime(), NOW);
    expect(parts.day).toBe('12');
    expect(parts.month).toBe('NOV');
    expect(parts.time).toBe('4:05 p. m.');
  });

  it('medianoche y mediodía se leen bien', () => {
    expect(eventDateParts(new Date(2026, 10, 9, 0, 0).getTime(), NOW).time).toBe('12:00 a. m.');
    expect(eventDateParts(new Date(2026, 10, 9, 12, 30).getTime(), NOW).time).toBe('12:30 p. m.');
  });

  it('dice hoy, mañana o en N días', () => {
    expect(eventDateParts(NOW + HOUR, NOW).when).toBe('Hoy');
    expect(eventDateParts(new Date(2026, 10, 9, 9, 0).getTime(), NOW).when).toBe('Mañana');
    expect(eventDateParts(new Date(2026, 10, 12, 9, 0).getTime(), NOW).when).toBe('En 4 días');
  });
});

describe('demoSectorEvents', () => {
  it('son futuros, están marcados como demo y mencionan el sector', () => {
    const events = demoSectorEvents(NOW, 'Lince');
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.isDemo && e.startsAt > NOW)).toBe(true);
    expect(events.some((e) => e.placeLabel.includes('Lince'))).toBe(true);
  });
});
