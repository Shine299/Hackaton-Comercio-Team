import { createDemoPosts } from './demoPosts';
import { matchesQuery, normalizeText, rankPosts } from './relevance';

const NOW = Date.UTC(2026, 10, 8, 12);

describe('normalizeText', () => {
  it('pasa a minúsculas y quita tildes', () => {
    expect(normalizeText('  Árbol Caído ')).toBe('arbol caido');
  });
});

describe('matchesQuery', () => {
  const [post] = createDemoPosts(NOW);

  it('sin búsqueda, todo coincide', () => {
    expect(matchesQuery(post, '')).toBe(true);
  });

  it('ignora mayúsculas y tildes', () => {
    const word = post.title.split(' ')[0];
    expect(matchesQuery(post, word.toUpperCase())).toBe(true);
  });

  it('exige todas las palabras', () => {
    expect(matchesQuery(post, 'zzzz-no-existe')).toBe(false);
  });
});

describe('rankPosts', () => {
  const posts = createDemoPosts(NOW);

  it('ordena de mayor a menor puntaje', () => {
    const ranked = rankPosts(posts, { now: NOW, radiusKm: 2 });
    for (let i = 1; i < ranked.length; i++) expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
  });

  it('excluye publicaciones vencidas o no activas', () => {
    const expired = { ...posts[0], id: 'vencida', expiresAt: NOW - 1 };
    const paused = { ...posts[0], id: 'pausada', status: 'paused' as const };
    const ids = rankPosts([...posts, expired, paused], { now: NOW, radiusKm: 2 }).map((r) => r.post.id);
    expect(ids).not.toContain('vencida');
    expect(ids).not.toContain('pausada');
  });

  it('una necesidad urgente suma puntaje pero no se marca como validada', () => {
    const base = { ...posts.find((p) => p.kind === 'request')!, urgent: false };
    const urgent = { ...base, id: 'urgente', urgent: true };
    const [a] = rankPosts([base], { now: NOW, radiusKm: 2 });
    const [b] = rankPosts([urgent], { now: NOW, radiusKm: 2 });
    expect(b.score).toBeGreaterThan(a.score);
    expect(b.reasons.join(' ')).toContain('sin validar');
  });
});
