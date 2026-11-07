import { getCategory } from './categories';
import { matchesQuery } from './relevance';
import type { Post, PostCategoryId, PostKind } from './types';

/** Filtros de Explorar. Esenciales: tipo, categoría, distancia. Avanzados: el resto. */
export type ExploreFilters = {
  query: string;
  kind: PostKind | 'all';
  category: PostCategoryId | 'all';
  /** Distancia máxima en km. */
  maxDistanceKm: number;
  // Avanzados
  availableNow: boolean;
  verifiedOnly: boolean;
  withRecommendations: boolean;
  postedWithin: 'any' | 'today' | 'week';
  /** Cobertura híbrida: incluye sectores contiguos más allá del radio inicial. */
  includeNearbySectors: boolean;
};

export const DEFAULT_FILTERS: ExploreFilters = {
  query: '',
  kind: 'all',
  category: 'all',
  maxDistanceKm: 2,
  availableNow: false,
  verifiedOnly: false,
  withRecommendations: false,
  postedWithin: 'any',
  includeNearbySectors: false,
};

/** Alcance máximo al ampliar a sectores contiguos. */
export const EXPANDED_COVERAGE_KM = 4;

const DAY = 86_400_000;

export function categoryText(post: Post): string {
  return getCategory(post.category).label;
}

/** Cantidad de filtros avanzados activos (para el indicador del botón «Filtros»). */
export function countAdvancedFilters(f: ExploreFilters): number {
  return [
    f.availableNow,
    f.verifiedOnly,
    f.withRecommendations,
    f.postedWithin !== 'any',
    f.includeNearbySectors,
  ].filter(Boolean).length;
}

/** `defaultRadiusKm` es el radio del sector: es el valor "sin filtrar" de la distancia. */
export function hasActiveFilters(
  f: ExploreFilters,
  defaultRadiusKm: number = DEFAULT_FILTERS.maxDistanceKm,
): boolean {
  return (
    f.query.trim().length > 0 ||
    f.kind !== 'all' ||
    f.category !== 'all' ||
    f.maxDistanceKm !== defaultRadiusKm ||
    countAdvancedFilters(f) > 0
  );
}

export function applyFilters(posts: Post[], f: ExploreFilters, now: number): Post[] {
  const reachKm = f.includeNearbySectors ? Math.max(f.maxDistanceKm, EXPANDED_COVERAGE_KM) : f.maxDistanceKm;

  return posts.filter((p) => {
    if (f.kind !== 'all' && p.kind !== f.kind) return false;
    if (f.category !== 'all' && p.category !== f.category) return false;
    if (p.distanceM / 1000 > reachKm) return false;
    if (f.availableNow && !p.availableNow) return false;
    if (f.verifiedOnly && p.author.trust === 'new') return false;
    if (f.withRecommendations && p.author.recommendations === 0) return false;
    if (f.postedWithin === 'today' && now - p.createdAt > DAY) return false;
    if (f.postedWithin === 'week' && now - p.createdAt > 7 * DAY) return false;
    return matchesQuery(p, f.query, categoryText(p));
  });
}
