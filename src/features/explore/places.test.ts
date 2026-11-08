import { explorePlaces, placeGroupOf, PLACE_KIND_LABEL } from './places';

// SPEC-047: directorio de lugares con horario honesto.
const TUE_NOON = new Date(2026, 10, 10, 12, 0);
const place = (id: string, amenity: string, extra: { openingHours?: string; distanceM?: number; name?: string } = {}) => ({
  id,
  name: extra.name ?? id,
  amenity,
  category: 'commerce',
  latitude: 0,
  longitude: 0,
  distanceM: extra.distanceM ?? 100,
  openingHours: extra.openingHours,
});

describe('placeGroupOf', () => {
  it('agrupa por tipo y deja fuera lo que no es para explorar', () => {
    expect(placeGroupOf('restaurant')).toBe('food');
    expect(placeGroupOf('supermarket')).toBe('shops');
    expect(placeGroupOf('pharmacy')).toBe('health');
    expect(placeGroupOf('bank')).toBe('services');
    expect(placeGroupOf('police')).toBeNull();
    expect(placeGroupOf('school')).toBeNull();
    expect(placeGroupOf('hairdresser')).toBeNull();
    expect(placeGroupOf('hardware')).toBeNull();
  });

  it('cada tipo que se muestra tiene nombre en español', () => {
    for (const kind of ['restaurant', 'cafe', 'supermarket', 'convenience', 'pharmacy', 'bank']) {
      expect(PLACE_KIND_LABEL[kind]).toBeTruthy();
    }
  });
});

describe('explorePlaces', () => {
  const places = [
    place('resto', 'restaurant', { openingHours: 'Mo-Su 12:00-23:00', distanceM: 300 }),
    place('cafe-sin-horario', 'cafe', { distanceM: 100 }),
    place('banco-cerrado', 'bank', { openingHours: 'Mo-Fr 15:00-18:00', distanceM: 200 }),
    place('raro', 'bakery', { openingHours: 'Mo-Fr 08:00-18:00; PH off', distanceM: 50 }),
    place('comisaria', 'police', { distanceM: 10 }),
  ];

  it('calcula el estado de cada lugar y no muestra los de emergencia', () => {
    const rows = explorePlaces(places, { group: 'all', openNow: false, query: '', date: TUE_NOON });
    expect(rows.map((r) => [r.place.id, r.state])).toEqual([
      ['raro', 'unknown'],
      ['cafe-sin-horario', 'unknown'],
      ['banco-cerrado', 'closed'],
      ['resto', 'open'],
    ]);
  });

  it('«Abierto ahora» deja solo los que tienen horario entendido y están abiertos', () => {
    const rows = explorePlaces(places, { group: 'all', openNow: true, query: '', date: TUE_NOON });
    expect(rows.map((r) => r.place.id)).toEqual(['resto']);
  });

  it('filtra por grupo y por nombre (sin tildes ni mayúsculas)', () => {
    expect(explorePlaces(places, { group: 'food', openNow: false, query: '', date: TUE_NOON }).map((r) => r.place.id)).toEqual([
      'raro',
      'cafe-sin-horario',
      'resto',
    ]);
    const named = [place('a', 'cafe', { name: 'Café Ñañu' }), place('b', 'cafe', { name: 'Otro' })];
    expect(explorePlaces(named, { group: 'all', openNow: false, query: 'cafe nanu', date: TUE_NOON }).map((r) => r.place.id)).toEqual(['a']);
  });
});
