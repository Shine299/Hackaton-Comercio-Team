import { useMemo } from 'react';

import { useSectorAlerts } from '@/features/emergency';
import { useOutboxStore } from '@/features/outbox';
import { useContactStore, useLocalPostsStore } from '@/features/posts';
import { useSectorStore } from '@/features/sector';

import { buildActivityFeed } from './feed';
import { useActivityReadStore } from './readStore';

/** Cuántos avisos de Actividad no se han leído (solo en este teléfono). Alimenta la campana del Inicio. */
export function useUnreadActivityCount(): number {
  const outbox = useOutboxStore((s) => s.items);
  const contacts = useContactStore((s) => s.requests);
  const localPosts = useLocalPostsStore((s) => s.posts);
  const sectorId = useSectorStore((s) => s.sector.id);
  const { data: sectorAlerts } = useSectorAlerts(sectorId);
  const readIds = useActivityReadStore((s) => s.readIds);

  return useMemo(() => {
    const ownPostTitles: Record<string, string> = {};
    for (const post of localPosts) ownPostTitles[post.id] = post.title;
    const feed = buildActivityFeed({ outbox, contacts, ownPostTitles, sectorAlerts: sectorAlerts ?? [] });
    return feed.filter((e) => !readIds[e.id]).length;
  }, [outbox, contacts, localPosts, sectorAlerts, readIds]);
}
