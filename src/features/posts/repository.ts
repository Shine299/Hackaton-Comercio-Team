import { isSupabaseConfigured } from '@/shared/supabase/client';

import { createDemoPosts } from './demoPosts';
import { createSupabasePostsRepository } from './supabaseRepository';
import type { Post } from './types';

/**
 * Contrato de acceso a publicaciones. Hoy lo cumple un mock con datos de demo;
 * en la etapa 10 se añade una implementación Supabase sin tocar la UI.
 */
export interface PostsRepository {
  /** Publicaciones cercanas al sector indicado (incluye sectores contiguos con su distancia). */
  listNearby(sectorId: string): Promise<Post[]>;
  getById(id: string): Promise<Post | null>;
}

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
