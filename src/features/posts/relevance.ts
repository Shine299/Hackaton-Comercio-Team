import type { Post } from './types';

/**
 * Relevancia inteligente (docs/01_producto §4). Función pura y explicable.
 *
 * Combina: cercanía, coincidencia con la búsqueda, frescura, señales de confianza,
 * contexto de urgencia y disponibilidad. Reglas de producto:
 *  - La popularidad no es el único criterio (la confianza pesa poco y está acotada).
 *  - Los vecinos nuevos reciben un pequeño impulso de exposición para no quedar invisibles.
 *  - La urgencia puede subir una necesidad, pero NO la marca como validada.
 */

export type RankContext = {
  now: number;
  /** Radio de cobertura del sector en km. Más allá, la cercanía aporta 0. */
  radiusKm: number;
  query?: string;
  /** Texto adicional buscable (por ejemplo la etiqueta de la categoría). */
  extraSearchText?: (post: Post) => string;
};

export type RankedPost = {
  post: Post;
  score: number;
  /** Motivos legibles; sirven para depurar y para transparencia futura. */
  reasons: string[];
};

const WEIGHTS = {
  distance: 0.3,
  query: 0.25,
  freshness: 0.15,
  trust: 0.1,
  newcomer: 0.06,
  urgency: 0.14,
  availability: 0.04,
} as const;

const HOUR = 3_600_000;
/** Escala de decaimiento de la frescura (≈ 3 días). */
const FRESHNESS_SCALE_HOURS = 72;

/** Minúsculas y sin tildes para comparar texto en español. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function tokenize(query: string): string[] {
  return normalizeText(query)
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

function queryScore(post: Post, tokens: string[], extra: string): number {
  if (tokens.length === 0) return 0;
  const title = normalizeText(post.title);
  const rest = normalizeText(`${post.description} ${post.author.displayName} ${extra}`);
  let total = 0;
  for (const token of tokens) {
    if (title.includes(token)) total += 1;
    else if (rest.includes(token)) total += 0.5;
  }
  return total / tokens.length;
}

/** `true` si todas las palabras de la búsqueda aparecen en alguna parte de la publicación. */
export function matchesQuery(post: Post, query: string, extra = ''): boolean {
  const tokens = tokenize(query);
  if (tokens.length === 0) return true;
  const haystack = normalizeText(
    `${post.title} ${post.description} ${post.author.displayName} ${extra}`,
  );
  return tokens.every((t) => haystack.includes(t));
}

function trustSignal(post: Post): number {
  const base = post.author.trust === 'endorsed' ? 0.7 : post.author.trust === 'verified' ? 0.45 : 0;
  const recs = Math.min(post.author.recommendations, 30) / 30;
  return Math.min(1, base + recs * 0.3);
}

export function scorePost(post: Post, ctx: RankContext): RankedPost {
  const reasons: string[] = [];
  const distanceKm = post.distanceM / 1000;
  const distanceScore = Math.max(0, Math.min(1, 1 - distanceKm / ctx.radiusKm));
  const ageHours = Math.max(0, (ctx.now - post.createdAt) / HOUR);
  const freshness = Math.exp(-ageHours / FRESHNESS_SCALE_HOURS);
  const tokens = tokenize(ctx.query ?? '');
  const extra = ctx.extraSearchText?.(post) ?? '';

  let score = WEIGHTS.distance * distanceScore + WEIGHTS.freshness * freshness;
  if (distanceScore > 0.6) reasons.push('Cerca de ti');
  if (freshness > 0.8) reasons.push('Reciente');

  if (tokens.length > 0) {
    const q = queryScore(post, tokens, extra);
    score += WEIGHTS.query * q;
    if (q > 0) reasons.push('Coincide con tu búsqueda');
  }

  const trust = trustSignal(post);
  score += WEIGHTS.trust * trust;
  if (trust > 0.7) reasons.push('Buena confianza comunitaria');

  if (post.author.trust === 'new') {
    score += WEIGHTS.newcomer;
    reasons.push('Vecino nuevo (impulso de visibilidad)');
  }

  if (post.kind === 'request' && post.urgent) {
    score += WEIGHTS.urgency;
    reasons.push('Necesidad declarada urgente (sin validar)');
  }

  if (post.availableNow) {
    score += WEIGHTS.availability;
    reasons.push('Disponible ahora');
  }

  return { post, score, reasons };
}

/** Ordena por relevancia (desc.). Desempata por publicación más reciente. */
export function rankPosts(posts: Post[], ctx: RankContext): RankedPost[] {
  return posts
    .filter((p) => p.status === 'active' && p.expiresAt > ctx.now)
    .map((p) => scorePost(p, ctx))
    .sort((a, b) => b.score - a.score || b.post.createdAt - a.post.createdAt);
}
