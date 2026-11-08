import { isSupabaseConfigured } from '@/shared/supabase/client';

import { createDemoPosts } from './demoPosts';
import { createSupabasePostsRepository } from './supabaseRepository';
import type { PostsRepository } from './types';

export type { PostsRepository };

/** MOCK: datos ficticios etiquetados como demo. No representa un servicio real. */
export const demoPostsRepository: PostsRepository = {
  async listNearby() {
    return createDemoPosts();
  },
  async getById(id) {
    return createDemoPosts().find((p) => p.id === id) ?? null;
  },
};

/** Con variables de Supabase usa el servidor; sin ellas, el mock de demo. */
export const postsRepository: PostsRepository = isSupabaseConfigured
  ? createSupabasePostsRepository(demoPostsRepository)
  : demoPostsRepository;
