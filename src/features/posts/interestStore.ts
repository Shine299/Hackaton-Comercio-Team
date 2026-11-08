import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

import type { Post, PostCategoryId } from './types';

const MAX_VIEWED = 60;
/** Peso que se da a un interés elegido a mano (equivale a abrir 3 publicaciones de esa categoría). */
const SEED_WEIGHT = 3;

/**
 * Lo que la persona ha mirado, solo en su teléfono. Sirve para recomendar publicaciones parecidas;
 * no se envía a ningún servidor.
 */
type InterestState = {
  /** Veces que abrió una publicación de cada categoría. */
  categoryViews: Partial<Record<PostCategoryId, number>>;
  /** Últimas publicaciones abiertas (la más reciente primero). */
  viewedIds: string[];
  recordView: (post: Pick<Post, 'id' | 'category' | 'isOwn'>) => void;
  /** Intereses elegidos en el tutorial: reemplazan el empuje inicial sin tocar lo ya mirado. */
  seed: (categories: PostCategoryId[]) => void;
  clear: () => void;
};

export const useInterestStore = create<InterestState>()(
  persist(
    (set) => ({
      categoryViews: {},
      viewedIds: [],
      recordView: (post) => {
        if (post.isOwn) return;
        set((s) => ({
          categoryViews: { ...s.categoryViews, [post.category]: (s.categoryViews[post.category] ?? 0) + 1 },
          viewedIds: [post.id, ...s.viewedIds.filter((id) => id !== post.id)].slice(0, MAX_VIEWED),
        }));
      },
      seed: (categories) =>
        set((s) => {
          const next = { ...s.categoryViews };
          for (const c of Object.keys(next) as PostCategoryId[]) if (next[c] === SEED_WEIGHT) delete next[c];
          for (const c of categories) next[c] = Math.max(next[c] ?? 0, SEED_WEIGHT);
          return { categoryViews: next };
        }),
      clear: () => set({ categoryViews: {}, viewedIds: [] }),
    }),
    { name: 'rvs.interest.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);
