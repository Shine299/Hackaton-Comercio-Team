import { createDemoPosts } from './demoPosts';
import { applyFilters, DEFAULT_FILTERS } from './filters';

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

  it('respeta la distancia máxima', () => {
    const out = applyFilters(posts, { ...DEFAULT_FILTERS, maxDistanceKm: 0.5 }, NOW);
    expect(out.every((p) => p.distanceM <= 500)).toBe(true);
  });
});
