import { getNeighborhoodPlaces, getPlacePoints, getShopPoints } from './places';

// SPEC-047: los comercios van en su propia capa; la de referencia de Emergencia no cambia.
const LINCE = { latitude: -12.0847, longitude: -77.0343 };

describe('getPlacePoints (referencia de Emergencia)', () => {
  it('no incluye comercios', () => {
    const ids = new Set(getNeighborhoodPlaces(LINCE, 2).filter((p) => p.category === 'commerce').map((p) => p.id));
    expect(ids.size).toBeGreaterThan(0);
    expect(getPlacePoints(LINCE, 2).some((p) => ids.has(p.id))).toBe(false);
  });
});

describe('getShopPoints', () => {
  it('son solo comercios, en la capa «shops»', () => {
    const points = getShopPoints(LINCE, 2);
    expect(points.length).toBeGreaterThan(0);
    expect(points.every((p) => p.layer === 'shops' && p.source === 'OpenStreetMap')).toBe(true);
  });
});

describe('getNeighborhoodPlaces', () => {
  it('trae la distancia al centro del sector, dentro del radio, de la más cercana a la más lejana', () => {
    const places = getNeighborhoodPlaces(LINCE, 1);
    expect(places.length).toBeGreaterThan(0);
    expect(places.every((p) => p.distanceM <= 1000)).toBe(true);
    for (let i = 1; i < places.length; i++) expect(places[i].distanceM).toBeGreaterThanOrEqual(places[i - 1].distanceM);
  });
});
