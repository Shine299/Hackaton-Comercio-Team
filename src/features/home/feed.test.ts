import type { Post } from '@/features/posts';

import { activeNeighbors, buildHomeFeed, feedTagFor, neighborsLabel } from './feed';
import type { SectorEvent } from '@/features/events';

// Con `.env` presente, el cliente real de Supabase abre SQLite al cargar y Jest no tiene el módulo nativo.
jest.mock('@/shared/supabase/client', () => ({ supabase: null }));
// El index de posts trae pantallas (Reanimated); aquí solo hace falta su lógica pura.
jest.mock('@/features/posts', () => ({
  ...jest.requireActual('@/features/posts/relevance'),
  ...jest.requireActual('@/features/posts/categories'),
}));
jest.mock('@/features/events', () => jest.requireActual('@/features/events/logic'));

const NOW = Date.UTC(2026, 10, 8, 12);
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

let seq = 0;
const post = (over: Partial<Post> = {}): Post => {
  seq += 1;
  return {
    id: `p${seq}`,
    kind: 'offer',
    category: 'tools',
    title: `Publicación ${seq}`,
    description: '',
    author: { id: `autor-${seq}`, displayName: 'Rosa M.', trust: 'new', recommendations: 0 },
    sectorId: 'lince',
    distanceM: 300,
    createdAt: NOW - HOUR,
    expiresAt: NOW + 3 * DAY,
    status: 'active',
    availableNow: true,
    isDemo: false,
    ...over,
  };
};

const event = (id: string, over: Partial<SectorEvent> = {}): SectorEvent => ({
  id,
  kind: 'event',
  title: id,
  body: '',
  startsAt: NOW + DAY,
  placeLabel: 'Parque',
  source: 'Vecinos',
  isDemo: false,
  origin: 'neighbor',
  goingCount: 0,
  iAmGoing: false,
  isMine: false,
  ...over,
});

const ids = (entries: ReturnType<typeof buildHomeFeed>) => entries.map((e) => e.id);
const ctx = { now: NOW, radiusKm: 2 };

describe('buildHomeFeed', () => {
  it('pone todo lo real antes que lo de demostración', () => {
    const feed = buildHomeFeed({ posts: [post({ id: 'demo', isDemo: true }), post({ id: 'real' })], events: [event('ev-demo', { isDemo: true })], ...ctx });
    expect(ids(feed)).toEqual(['real', 'demo', 'ev-demo']);
  });

  it('intercala un evento después de cada 2 publicaciones', () => {
    const posts = [1, 2, 3, 4].map((n) => post({ id: `p-${n}`, createdAt: NOW - n * HOUR }));
    const feed = buildHomeFeed({ posts, events: [event('e1'), event('e2', { startsAt: NOW + 2 * DAY })], ...ctx });
    expect(feed.map((e) => e.type)).toEqual(['post', 'post', 'event', 'post', 'post', 'event']);
    expect(ids(feed).filter((id) => id.startsWith('e'))).toEqual(['e1', 'e2']);
  });

  it('si se acaban las publicaciones, siguen los eventos (y al revés)', () => {
    expect(buildHomeFeed({ posts: [post({ id: 'solo' })], events: [event('e1'), event('e2', { startsAt: NOW + 2 * DAY })], ...ctx }).map((e) => e.id)).toEqual([
      'solo',
      'e1',
      'e2',
    ]);
    expect(buildHomeFeed({ posts: [], events: [event('e1')], ...ctx }).map((e) => e.id)).toEqual(['e1']);
  });

  it('excluye lo propio, lo vencido, lo pausado y lo que está fuera del radio', () => {
    const feed = buildHomeFeed({
      posts: [
        post({ id: 'ok' }),
        post({ id: 'mia', isOwn: true }),
        post({ id: 'vencida', expiresAt: NOW - 1 }),
        post({ id: 'pausada', status: 'paused' }),
        post({ id: 'lejos', distanceM: 5_000 }),
      ],
      events: [],
      ...ctx,
    });
    expect(ids(feed)).toEqual(['ok']);
  });

  it('solo incluye eventos de los próximos 7 días (los que están en curso también)', () => {
    const feed = buildHomeFeed({
      posts: [],
      events: [event('en-curso', { startsAt: NOW - HOUR }), event('pronto', { startsAt: NOW + 6 * DAY }), event('lejano', { startsAt: NOW + 8 * DAY }), event('pasado', { startsAt: NOW - 3 * HOUR })],
      ...ctx,
    });
    expect(ids(feed)).toEqual(['en-curso', 'pronto']);
  });

  it('muestra como máximo 30 elementos', () => {
    const posts = Array.from({ length: 40 }, () => post());
    expect(buildHomeFeed({ posts, events: [], ...ctx })).toHaveLength(30);
    expect(buildHomeFeed({ posts, events: [], ...ctx, limit: 5 })).toHaveLength(5);
  });
});

describe('activeNeighbors', () => {
  it('cuenta autores distintos con publicaciones de los últimos 7 días', () => {
    const a = { id: 'a', displayName: 'A', trust: 'new' as const, recommendations: 0 };
    const b = { id: 'b', displayName: 'B', trust: 'new' as const, recommendations: 0 };
    const c = { id: 'c', displayName: 'C', trust: 'new' as const, recommendations: 0 };
    const result = activeNeighbors(
      [post({ author: a }), post({ author: a, createdAt: NOW - 2 * DAY }), post({ author: b }), post({ author: c, createdAt: NOW - 10 * DAY })],
      NOW,
    );
    expect(result).toEqual({ count: 2, isDemo: false });
  });

  it('avisa si el número sale solo de datos de demostración', () => {
    expect(activeNeighbors([post({ isDemo: true })], NOW)).toEqual({ count: 1, isDemo: true });
    expect(activeNeighbors([], NOW)).toEqual({ count: 0, isDemo: false });
  });
});

describe('feedTagFor', () => {
  it('dice Ofrezco, Necesito o Negocio', () => {
    expect(feedTagFor(post({ kind: 'offer' })).label).toBe('Ofrezco');
    expect(feedTagFor(post({ kind: 'request' })).label).toBe('Necesito');
    expect(feedTagFor(post({ category: 'business' })).label).toBe('Negocio');
  });
});

describe('neighborsLabel (SPEC-052)', () => {
  it('dice el número de vecinos activos y el sector, en singular o plural', () => {
    expect(neighborsLabel(7, 'San Isidro')).toBe('7 vecinos activos en San Isidro');
    expect(neighborsLabel(1, 'San Isidro')).toBe('1 vecino activo en San Isidro');
  });
});
