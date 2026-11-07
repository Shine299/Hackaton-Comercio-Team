import { getHelpType, getIncidentCategory, getResourceKind, type SectorAlert } from '@/features/emergency';
import type { OutboxItem } from '@/features/outbox';
import type { ContactRequest } from '@/features/posts';
import type { SyncStatus } from '@/shared/sync/status';
import type { IconName } from '@/shared/ui';

export type ActivityFilter = 'all' | 'requests' | 'messages' | 'community' | 'alerts';
export type ActivityCategory = Exclude<ActivityFilter, 'all' | 'messages'>;

export type ActivityTarget =
  | { kind: 'post'; id: string }
  | { kind: 'report'; id: string }
  | { kind: 'board' }
  | { kind: 'emergency' };

export type ActivityEntry = {
  id: string;
  category: ActivityCategory;
  title: string;
  subtitle?: string;
  at: number;
  /** Ausente en las alertas de sector: vienen del servidor, no de este teléfono. */
  syncStatus?: SyncStatus;
  icon: IconName;
  isDemo: boolean;
  /** Prioridad de la cola (emergencia primero dentro de Alertas). */
  rank: number;
  target: ActivityTarget;
  /** Si existe, la fila muestra el título de la publicación relacionada. */
  postId?: string;
};

export const ACTIVITY_FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'requests', label: 'Solicitudes' },
  { id: 'messages', label: 'Mensajes' },
  { id: 'community', label: 'Comunidad' },
  { id: 'alerts', label: 'Alertas' },
];

const str = (value: unknown) => (typeof value === 'string' ? value : '');
const RANK = { emergency: 2, urgent: 1, normal: 0 } as const;

type FeedInput = {
  outbox: OutboxItem[];
  contacts: ContactRequest[];
  /** Títulos de publicaciones propias, por id. */
  ownPostTitles: Record<string, string>;
  /** Alertas reales activas del sector (vacío sin servidor). */
  sectorAlerts: SectorAlert[];
};

/** Lista cronológica de la cola local y de las solicitudes de contacto. Las alertas van arriba. */
export function buildActivityFeed({ outbox, contacts, ownPostTitles, sectorAlerts }: FeedInput): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const contactedPosts = new Set(contacts.map((c) => c.postId));

  for (const c of contacts) {
    entries.push({
      id: `contact:${c.id}`,
      category: 'requests',
      title: 'Solicitud de contacto',
      subtitle: c.message || undefined,
      at: c.createdAt,
      syncStatus: c.syncStatus,
      icon: 'message-text-outline',
      isDemo: false,
      rank: 0,
      target: { kind: 'post', id: c.postId },
      postId: c.postId,
    });
  }

  for (const item of outbox) {
    const base = { id: `outbox:${item.id}`, at: item.createdAt, syncStatus: item.syncStatus, isDemo: false, rank: RANK[item.priority] };
    const p = item.payload;
    switch (item.type) {
      case 'interaction.request': {
        const postId = str(p.postId);
        if (contactedPosts.has(postId)) break; // ya aparece como solicitud de contacto
        entries.push({ ...base, category: 'requests', title: 'Solicitud de contacto', subtitle: str(p.message) || undefined, icon: 'message-text-outline', target: { kind: 'post', id: postId }, postId });
        break;
      }
      case 'post.create': {
        const postId = str(p.postId);
        const title = ownPostTitles[postId];
        entries.push({ ...base, category: 'community', title: title ? `Publicaste «${title}»` : 'Publicaste en tu sector', icon: 'plus-circle-outline', target: { kind: 'post', id: postId } });
        break;
      }
      case 'moderation.report': {
        const postId = str(p.postId);
        entries.push({ ...base, category: 'community', title: 'Reportaste una publicación', icon: 'flag-outline', target: { kind: 'post', id: postId }, postId });
        break;
      }
      case 'resource.offer':
        entries.push({ ...base, category: 'community', title: `Ofreciste ayuda: ${getResourceKind(str(p.resource)).label.toLowerCase()}`, subtitle: `Zona aproximada: ${str(p.sectorName)}`, icon: 'hand-heart-outline', target: { kind: 'board' } });
        break;
      case 'emergency.help':
        entries.push({
          ...base,
          category: 'alerts',
          title: p.immediateDanger ? 'Alerta de peligro inmediato' : `Pediste ayuda: ${getHelpType(str(p.type)).label.toLowerCase()}`,
          subtitle: `Zona aproximada: ${str(p.sectorName)}`,
          icon: p.immediateDanger ? 'alarm-light-outline' : 'lifebuoy',
          target: { kind: 'report', id: str(p.reportId) },
        });
        break;
      case 'emergency.incident':
        entries.push({ ...base, category: 'alerts', title: `Incidente: ${getIncidentCategory(str(p.category)).label.toLowerCase()}`, subtitle: `Zona aproximada: ${str(p.sectorName)}`, icon: 'alert-octagon-outline', target: { kind: 'report', id: str(p.reportId) } });
        break;
      case 'emergency.vulnerable':
        entries.push({ ...base, category: 'alerts', title: 'Alerta por un vecino', subtitle: `Zona aproximada: ${str(p.sectorName)} · no validada`, icon: 'account-heart-outline', target: { kind: 'board' } });
        break;
    }
  }

  for (const alert of sectorAlerts) {
    entries.push({
      id: `alert:${alert.id}`,
      category: 'alerts',
      title: alert.title,
      subtitle: `${alert.body} · Activada por: ${alert.source}`,
      at: alert.createdAt,
      icon: 'bullhorn-outline',
      isDemo: false,
      rank: alert.severity === 'critical' ? 3 : 2,
      target: { kind: 'emergency' },
    });
  }

  // Alertas arriba (primero las de mayor prioridad); el resto, más reciente primero.
  return entries.sort((a, b) => {
    const aAlert = a.category === 'alerts' ? 1 : 0;
    const bAlert = b.category === 'alerts' ? 1 : 0;
    if (aAlert !== bAlert) return bAlert - aAlert;
    if (aAlert && a.rank !== b.rank) return b.rank - a.rank;
    return b.at - a.at;
  });
}

export function filterFeed(entries: ActivityEntry[], filter: ActivityFilter): ActivityEntry[] {
  if (filter === 'all') return entries;
  if (filter === 'messages') return []; // el chat no existe todavía
  return entries.filter((e) => e.category === filter);
}
