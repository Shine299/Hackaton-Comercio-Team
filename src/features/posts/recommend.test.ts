import { createDemoPosts } from './demoPosts';
import { recommendPosts } from './recommend';

const NOW = Date.UTC(2026, 10, 8, 12);
const ctx = { now: NOW, radiusKm: 2 };
const posts = createDemoPosts(NOW);

describe('recommendPosts', () => {
  it('respeta el límite pedido', () => {
    expect(recommendPosts(posts, ctx, { categoryViews: {}, viewedIds: [] }, 3)).toHaveLength(3);
  });

  it('sin historial, el motivo es la cercanía', () => {
    const [first] = recommendPosts(posts, ctx, { categoryViews: {}, viewedIds: [] });
    expect(first.reason).toBe('Cerca de ti');
  });

  it('empuja la categoría que más se mira y lo explica', () => {
    const recs = recommendPosts(posts, ctx, { categoryViews: { tools: 9 }, viewedIds: [] }, 4);
    expect(recs[0].post.category).toBe('tools');
    expect(recs[0].reason).toContain('miras');
  });

  it('no recomienda publicaciones propias', () => {
    const own = posts.map((p) => ({ ...p, isOwn: true }));
    expect(recommendPosts(own, ctx, { categoryViews: {}, viewedIds: [] })).toHaveLength(0);
  });

  it('baja lo que ya se vio', () => {
    const first = recommendPosts(posts, ctx, { categoryViews: {}, viewedIds: [] }, 1)[0].post;
    const after = recommendPosts(posts, ctx, { categoryViews: {}, viewedIds: [first.id] }, 1)[0].post;
    expect(after.id).not.toBe(first.id);
  });
});
