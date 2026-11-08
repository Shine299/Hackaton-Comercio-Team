import { useCallback } from 'react';

import { useEmergencyStore, useSectorAlerts } from '@/features/emergency';
import { useSectorEvents } from '@/features/events';
import { useNearbyPosts } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { useSessionStore } from '@/features/session';

import { buildSummary } from './summary';

/**
 * Lo que Yunta dice primero al abrir la conversación (SPEC-053): arma el resumen con los datos que ya tiene la app
 * (alerta del sector, eventos, publicaciones y tus reportes pendientes). Devuelve una función para que el texto se
 * calcule en el momento de hablar, con la hora y los datos de ese instante.
 */
export function useConversationSummary(): () => string {
  const sector = useSectorStore((s) => s.sector);
  const registered = useSessionStore((s) => s.registered);
  const displayName = useSessionStore((s) => s.displayName);
  const { data: alerts } = useSectorAlerts(sector.id);
  const { data: eventsData } = useSectorEvents(sector.id, sector.name);
  const { data: postsData } = useNearbyPosts(sector.id);
  const reports = useEmergencyStore((s) => s.reports);

  return useCallback(() => {
    const now = Date.now();
    const alert = alerts?.[0];
    return buildSummary({
      now,
      name: registered && displayName ? displayName : undefined,
      sectorName: sector.name,
      alert: alert ? { title: alert.title, source: alert.source } : undefined,
      events: (eventsData?.events ?? []).slice(0, 5).map((e) => ({ title: e.title, startsAt: e.startsAt, isDemo: e.isDemo })),
      posts: (postsData?.posts ?? [])
        .filter((p) => p.expiresAt > now)
        .map((p) => ({ kind: p.kind, urgent: p.urgent, isDemo: p.isDemo })),
      pendingReports: reports.filter((r) => r.status !== 'resolved').length,
    });
  }, [alerts, eventsData, postsData, reports, registered, displayName, sector.name]);
}
