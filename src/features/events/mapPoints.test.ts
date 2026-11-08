import { eventMapPoints } from './mapPoints';
import { demoSectorEvents } from './sectorEvents';

// Igual que `sectorEvents.test.ts`: sin Supabase ni cola de envío (módulos nativos); aquí solo hay lógica pura.
jest.mock('@/shared/supabase/client', () => ({ supabase: null }));
jest.mock('./localStore', () => ({ useEventsLocalStore: jest.fn() }));

const NOW = new Date(2026, 10, 8, 12).getTime();
const CENTER = { latitude: -12.0847, longitude: -77.0343 };
// Ubicador de prueba: determinista y cerca del centro, como `approxPoint`.
const locate = (id: string) => ({
  latitude: CENTER.latitude + id.length / 10000,
  longitude: CENTER.longitude,
});

describe('eventMapPoints', () => {
  const events = demoSectorEvents(NOW, 'Lince');

  it('hace un punto por evento, en la capa de eventos y apuntando a su detalle', () => {
    const points = eventMapPoints(events, NOW, locate);
    expect(points).toHaveLength(events.length);
    expect(points.every((p) => p.layer === 'events')).toBe(true);
    expect(points[0].target).toEqual({ kind: 'event', id: events[0].id });
  });

  it('la posición es estable y cercana al centro del sector (zona aproximada)', () => {
    const a = eventMapPoints(events, NOW, locate);
    const b = eventMapPoints(events, NOW, locate);
    expect(a.map((p) => p.coord)).toEqual(b.map((p) => p.coord));
    for (const p of a) {
      expect(Math.abs(p.coord.latitude - CENTER.latitude)).toBeLessThan(0.012);
      expect(Math.abs(p.coord.longitude - CENTER.longitude)).toBeLessThan(0.012);
    }
  });

  it('en una casa solo dice «zona aproximada»', () => {
    const house = events.find((e) => e.venueKind === 'approx_zone');
    expect(house).toBeDefined();
    const point = eventMapPoints([house!], NOW, locate)[0];
    expect(point.detail).toContain('Zona aproximada');
  });
});
