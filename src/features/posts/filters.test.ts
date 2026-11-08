import { createDemoPosts } from './demoPosts';
import { applyFilters, DEFAULT_FILTERS, filterFavorites } from './filters';

const NOW = Date.UTC(2026, 10, 8, 12);
const posts = createDemoPosts(NOW);

describe('applyFilters', () => {
  it('filtra por categoría', () => {
    const out = applyFilters(posts, { ...DEFAULT_FILTERS, category: 'business', maxDistanceKm: 5 }, NOW);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((p) => p.category === 'business')).toBe(true);
  });

  it('filtra por tipo', () => {
    const out = applyFilters(posts, { ...DEFAULT_FILTERS, kind: 'request', maxDistanceKm: 5 }, NOW);
    expect(out.every((p) => p.kind === 'request')).toBe(true);
  });

  it('separa animales de objetos y favores', () => {
    const animals = applyFilters(posts, { ...DEFAULT_FILTERS, group: 'animals', maxDistanceKm: 5 }, NOW);
    const objects = applyFilters(posts, { ...DEFAULT_FILTERS, group: 'objects', maxDistanceKm: 5 }, NOW);
    expect(animals.length).toBeGreaterThan(0);
    expect(animals.every((p) => p.category === 'pets')).toBe(true);
    expect(objects.length).toBeGreaterThan(0);
    expect(objects.some((p) => p.category === 'pets')).toBe(false);
  });

  it('respeta la distancia máxima', () => {
    const out = applyFilters(posts, { ...DEFAULT_FILTERS, maxDistanceKm: 0.5 }, NOW);
    expect(out.every((p) => p.distanceM <= 500)).toBe(true);
  });
});

describe('filterFavorites', () => {
  it('deja solo las guardadas y conserva el orden', () => {
    const ids = [posts[3].id, posts[1].id];
    expect(filterFavorites(posts, ids).map((p) => p.id)).toEqual([posts[1].id, posts[3].id]);
  });

  it('sin favoritos devuelve una lista vacía', () => {
    expect(filterFavorites(posts, [])).toEqual([]);
  });

  it('ignora ids que ya no existen', () => {
    expect(filterFavorites(posts, ['no-existe'])).toEqual([]);
  });
});
