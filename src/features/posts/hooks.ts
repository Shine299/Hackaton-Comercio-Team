import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { useLocalPostsStore } from './localStore';
import { postsRepository } from './repository';
import type { Post } from './types';

export const postsKeys = {
  nearby: (sectorId: string) => ['posts', 'nearby', sectorId] as const,
  detail: (id: string) => ['posts', 'detail', id] as const,
};

export type NearbyPosts = {
  posts: Post[];
  /** Instante en que se obtuvieron los datos; sirve de «ahora» estable para tiempos relativos. */
  fetchedAt: number;
};

/** Publicaciones cercanas: las del repositorio más las creadas en este dispositivo. */
export function useNearbyPosts(sectorId: string) {
  const localPosts = useLocalPostsStore((s) => s.posts);
  const query = useQuery<NearbyPosts>({
    queryKey: postsKeys.nearby(sectorId),
    queryFn: async () => {
      const posts = await postsRepository.listNearby(sectorId);
      return { posts, fetchedAt: Date.now() };
    },
    // Los datos de demo se generan con tiempos relativos; los refrescamos de vez en cuando.
    staleTime: 60_000,
  });

  const data = useMemo<NearbyPosts | undefined>(() => {
    if (!query.data) return undefined;
    const own = localPosts.filter((p) => p.sectorId === sectorId);
    // Una publicación propia ya sincronizada vuelve del servidor con el mismo id: se muestra solo la local.
    const ownIds = new Set(localPosts.map((p) => p.id));
    return { ...query.data, posts: [...own, ...query.data.posts.filter((p) => !ownIds.has(p.id))] };
  }, [query.data, localPosts, sectorId]);

  return { ...query, data };
}

export type PostWithTime = { post: Post; fetchedAt: number };

/** Detalle de una publicación (primero las propias de este dispositivo). */
export function usePost(id: string) {
  const [now] = useState(() => Date.now());
  const own = useLocalPostsStore((s) => s.posts.find((p) => p.id === id));
  const query = useQuery<PostWithTime | null>({
    queryKey: postsKeys.detail(id),
    queryFn: async () => {
      const post = await postsRepository.getById(id);
      return post ? { post, fetchedAt: Date.now() } : null;
    },
    enabled: !own,
  });

  if (own) {
    return { data: { post: own, fetchedAt: now } as PostWithTime | null, isLoading: false };
  }
  return { data: query.data, isLoading: query.isLoading };
}
