import { useEmergencyStore, type IncidentStatus, type ResourceStage } from '@/features/emergency';
import { isUnsent, useOutboxStore, type OutboxItem } from '@/features/outbox';
import { useLocalMessagesStore } from '@/features/chat';
import { useContactStore, useLocalPostsStore, useReportStore } from '@/features/posts';
import { supabase } from '@/shared/supabase/client';
import type { SyncStatus } from '@/shared/sync/status';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

type ServerRows = {
  reports: { id: string; status: IncidentStatus }[];
  vulnerable: { id: string; status: IncidentStatus }[];
  offers: { id: string; stage: ResourceStage; quantity: number | null; delivered_quantity: number }[];
  requests: { post_id: string; status: string }[];
  postReports: { post_id: string; status: string }[];
};

/** Lo que el servidor tiene de este usuario (RLS: solo filas propias). `null` si no hay conexión. */
async function fetchServerRows(): Promise<ServerRows | null> {
  if (!supabase) return null;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null; // sin sesión aún no hay nada propio que leer

  const [reports, vulnerable, offers, requests, postReports] = await Promise.all([
    supabase.from('emergency_reports').select('id,status'),
    supabase.from('vulnerable_alerts').select('id,status'),
    supabase.from('resource_offers').select('id,stage,quantity,delivered_quantity'),
    supabase.from('post_requests').select('post_id,status'),
    supabase.from('post_reports').select('post_id,status'),
  ]);
  if (reports.error || vulnerable.error || offers.error || requests.error || postReports.error) return null;
  return {
    reports: reports.data as ServerRows['reports'],
    vulnerable: vulnerable.data as ServerRows['vulnerable'],
    offers: offers.data as ServerRows['offers'],
    requests: requests.data,
    postReports: postReports.data,
  };
}

/** Estados «recibido» según la cola: solo elementos que un transporte real marcó como enviados. */
function receivedByType(items: OutboxItem[], type: OutboxItem['type'], key: string): string[] {
  return items.filter((i) => i.type === type && !isUnsent(i)).map((i) => str(i.payload[key]));
}

let running = false;

/**
 * Pone al día los estados locales con la cola y con el servidor:
 * 1. Lo que la cola ya envió pasa de «guardado en tu teléfono» a «recibido».
 * 2. Lo que el servidor sabe (en revisión, validado, etapa de una oferta…) manda sobre lo local.
 * Nunca retrocede un estado ni inventa uno: sin respuesta del servidor solo aplica el paso 1.
 */
export async function reconcileWithServer(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const items = useOutboxStore.getState().items;

    // 1) Cola → estados locales.
    const reports: Record<string, IncidentStatus> = {};
    for (const id of [
      ...receivedByType(items, 'emergency.help', 'reportId'),
      ...receivedByType(items, 'emergency.incident', 'reportId'),
    ]) {
      reports[id] = 'received';
    }
    const vulnerable: Record<string, IncidentStatus> = {};
    for (const id of receivedByType(items, 'emergency.vulnerable', 'alertId')) vulnerable[id] = 'received';
    const offers: Record<string, { stage?: ResourceStage; quantity?: number; delivered?: number; synced?: boolean }> = {};
    for (const id of receivedByType(items, 'resource.offer', 'offerId')) offers[id] = { synced: true };

    const postStatuses = receivedByType(items, 'post.create', 'postId');
    for (const id of postStatuses) useLocalPostsStore.getState().update(id, { syncStatus: 'received' });

    const contactStatuses: Record<string, SyncStatus> = {};
    for (const id of receivedByType(items, 'interaction.request', 'postId')) contactStatuses[id] = 'received';
    const reportStatuses: Record<string, SyncStatus> = {};
    for (const id of receivedByType(items, 'moderation.report', 'postId')) reportStatuses[id] = 'received';

    const messageStatuses: Record<string, SyncStatus> = {};
    for (const id of receivedByType(items, 'chat.message', 'messageId')) messageStatuses[id] = 'received';
    useLocalMessagesStore.getState().setSyncStatus(messageStatuses);

    // 2) Servidor → estados locales (sobrescribe lo anterior donde hay dato real).
    const server = await fetchServerRows().catch(() => null);
    if (server) {
      for (const r of server.reports) reports[r.id] = r.status;
      for (const v of server.vulnerable) vulnerable[v.id] = v.status;
      for (const o of server.offers) {
        offers[o.id] = {
          stage: o.stage,
          quantity: o.quantity ?? undefined,
          delivered: o.quantity ? o.delivered_quantity : undefined,
          synced: true,
        };
      }
      for (const r of server.requests) contactStatuses[r.post_id] = 'received';
      for (const r of server.postReports) {
        reportStatuses[r.post_id] = r.status === 'received' ? 'received' : 'in_review';
      }
    }

    useEmergencyStore.getState().applyServer({ reports, vulnerable, offers });
    useContactStore.getState().setSyncStatus(contactStatuses);
    useReportStore.getState().setSyncStatus(reportStatuses);
  } finally {
    running = false;
  }
}

/** Intenta enviar la cola y, pase lo que pase, reconcilia con lo que quedó confirmado. */
export async function syncNow(): Promise<void> {
  await useOutboxStore.getState().flush();
  await reconcileWithServer();
}
