import { type SectorEvent, upcomingEvents } from '@/features/events';
import { categoryText, rankPosts, type Post } from '@/features/posts';
import type { IconName } from '@/shared/ui';

/**
 * Feed del Inicio (SPEC-044): publicaciones de Ayuda y eventos del barrio en una sola lista.
 * Lo real va antes que lo de demostración, y en cada grupo se intercala un evento cada 2 publicaciones.
 */
export type HomeFeedEntry = { type: 'post'; id: string; post: Post } | { type: 'event'; id: string; event: SectorEvent };

const DAY = 24 * 3_600_000;
const EVENT_WINDOW_MS = 7 * DAY;
const WEEK_MS = 7 * DAY;
const POSTS_PER_EVENT = 2;
const DEFAULT_LIMIT = 30;

type FeedInput = {
  posts: Post[];
  events: SectorEvent[];
  now: number;
  radiusKm: number;
  limit?: number;
};

function interleave(posts: Post[], events: SectorEvent[]): HomeFeedEntry[] {
  const out: HomeFeedEntry[] = [];
  let p = 0;
  let e = 0;
  while (p < posts.length || e < events.length) {
    for (let i = 0; i < POSTS_PER_EVENT && p < posts.length; i++, p++) out.push({ type: 'post', id: posts[p].id, post: posts[p] });
    if (e < events.length) {
      out.push({ type: 'event', id: events[e].id, event: events[e] });
      e++;
    }
  }
  return out;
}

export function buildHomeFeed({ posts, events, now, radiusKm, limit = DEFAULT_LIMIT }: FeedInput): HomeFeedEntry[] {
  const candidates = posts.filter((p) => !p.isOwn && p.distanceM / 1000 <= radiusKm);
  const ranked = rankPosts(candidates, { now, radiusKm, extraSearchText: categoryText }).map((r) => r.post);
  const soon = upcomingEvents(events, now).filter((e) => e.startsAt <= now + EVENT_WINDOW_MS);

  const real = interleave(
    ranked.filter((p) => !p.isDemo),
    soon.filter((e) => !e.isDemo),
  );
  const demo = interleave(
    ranked.filter((p) => p.isDemo),
    soon.filter((e) => e.isDemo),
  );
  return [...real, ...demo].slice(0, limit);
}

/** Cuántos vecinos distintos publicaron en los últimos 7 días. Solo un número: nunca nombres. */
export function activeNeighbors(posts: Post[], now: number): { count: number; isDemo: boolean } {
  const recent = posts.filter((p) => p.createdAt >= now - WEEK_MS);
  const count = new Set(recent.map((p) => p.author.id)).size;
  return { count, isDemo: recent.length > 0 && recent.every((p) => p.isDemo) };
}

/** Línea corta bajo el saludo del Inicio (SPEC-052): «7 vecinos activos en San Isidro». */
export function neighborsLabel(count: number, sectorName: string): string {
  return `${count} ${count === 1 ? 'vecino activo' : 'vecinos activos'} en ${sectorName}`;
}

/** Etiqueta de tipo de la tarjeta: siempre texto + ícono. */
export function feedTagFor(post: Post): { label: 'Ofrezco' | 'Necesito' | 'Negocio'; icon: IconName } {
  if (post.category === 'business') return { label: 'Negocio', icon: 'storefront-outline' };
  return post.kind === 'offer' ? { label: 'Ofrezco', icon: 'hand-heart-outline' } : { label: 'Necesito', icon: 'hand-back-left-outline' };
}
