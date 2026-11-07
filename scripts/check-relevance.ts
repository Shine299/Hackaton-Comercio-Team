/**
 * Comprobación manual del orden de relevancia con los datos de demo.
 * Uso: node scripts/check-relevance.ts   (Node >= 22.6 con soporte nativo de TypeScript)
 */
import { createDemoPosts } from '../src/features/posts/demoPosts.ts';
import { rankPosts } from '../src/features/posts/relevance.ts';

const now = Date.now();
const posts = createDemoPosts(now).filter((p) => p.distanceM <= 2000);

function show(title: string, query?: string) {
  console.log(`\n== ${title}`);
  const ranked = rankPosts(posts, { now, radiusKm: 2, query });
  ranked.forEach((r, i) => {
    console.log(
      `${String(i + 1).padStart(2)}. ${r.score.toFixed(3)}  ${r.post.title}  [${r.post.author.trust}]  ${r.reasons.join(', ')}`,
    );
  });
}

show('Sin búsqueda');
show('Búsqueda: "escalera"', 'escalera');
show('Búsqueda: "ayuda mueble"', 'ayuda mueble');
