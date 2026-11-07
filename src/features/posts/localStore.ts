import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

import type { Post } from './types';

/**
 * Publicaciones creadas en este dispositivo. Viven aquí hasta que existan servidor y sincronización
 * (etapas 9 y 10). Su `syncStatus` es `local`: están guardadas en el teléfono, NO publicadas.
 */
type LocalPostsState = {
  posts: Post[];
  add: (post: Post) => void;
  update: (id: string, patch: Partial<Post>) => void;
};

export const useLocalPostsStore = create<LocalPostsState>()(
  persist(
    (set) => ({
      posts: [],
      add: (post) => set((state) => ({ posts: [post, ...state.posts] })),
      update: (id, patch) =>
        set((state) => ({
          posts: state.posts.map((post) => (post.id === id ? { ...post, ...patch } : post)),
        })),
    }),
    { name: 'rvs.local-posts.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);
