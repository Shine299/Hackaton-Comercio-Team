import { getCategory } from './categories';
import { rankPosts, type RankContext } from './relevance';
import type { Post, PostCategoryId } from './types';

export type Recommendation = { post: Post; reason: string };

type Interest = {
  categoryViews: Partial<Record<PostCategoryId, number>>;
  viewedIds: string[];
  /** Categorías que la persona guardó. */
  savedCategories?: PostCategoryId[];
};

/**
 * Recomendaciones para Inicio: parte de la relevancia general (cercanía, frescura, confianza) y suma un
 * empuje por las categorías que la persona más mira o guarda. Lo ya visto baja para dar paso a novedades.
 * Sin historial, devuelve lo más relevante cerca. Las publicaciones propias no se recomiendan.
 */
export function recommendPosts(posts: Post[], ctx: RankContext, interest: Interest, limit = 4): Recommendation[] {
  const views = interest.categoryViews;
  const total = Object.values(views).reduce((sum, n) => sum + (n ?? 0), 0);
  const saved = new Set(interest.savedCategories ?? []);
  const seen = new Set(interest.viewedIds);

  return rankPosts(
    posts.filter((p) => !p.isOwn),
    ctx,
  )
    .map(({ post, score }) => {
      const share = total > 0 ? (views[post.category] ?? 0) / total : 0;
      const isSaved = saved.has(post.category);
      const boosted = score + share * 0.5 + (isSaved ? 0.12 : 0) - (seen.has(post.id) ? 0.15 : 0);
      const label = getCategory(post.category).label;
      const reason =
        share >= 0.25 ? `Porque miras ${label.toLowerCase()}` : isSaved ? `Porque guardaste ${label.toLowerCase()}` : 'Cerca de ti';
      return { post, reason, boosted };
    })
    .sort((a, b) => b.boosted - a.boosted)
    .slice(0, limit)
    .map(({ post, reason }) => ({ post, reason }));
}
