import { useLocalPostsStore } from '@/features/posts';
import { useSessionStore } from '@/features/session';
import { ensureAnonymousUser, isSupabaseConfigured, supabase } from '@/shared/supabase/client';

import { setTransport, type OutboxItem, type SendResult, type SyncTransport } from '@/features/outbox';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DUPLICATE_KEY = '23505';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * Envía cada acción de la cola a Supabase. Cada fila usa el UUID generado en el cliente como clave,
 * así que reintentar nunca duplica. Solo se suben datos aproximados (sector, categoría): el texto
 * privado, las fotos y el diagnóstico de «vecino vulnerable» se quedan en el teléfono.
 * `received` se devuelve únicamente tras una respuesta real del servidor.
 */
async function sendToServer(item: OutboxItem): Promise<SendResult> {
  if (!supabase) return { ok: false, error: 'Sin servidor configurado' };
  const userId = await ensureAnonymousUser();
  const p = item.payload;

  let error: { code?: string; message: string } | null = null;

  switch (item.type) {
    case 'post.create': {
      const post = useLocalPostsStore.getState().posts.find((x) => x.id === p.postId);
      if (!post) return { ok: false, error: 'Publicación no encontrada en el teléfono' };
      const profile = await supabase.rpc('upsert_profile', {
        p_display_name: useSessionStore.getState().displayName || post.author.displayName || 'Vecino',
      });
      if (profile.error || !profile.data) {
        return { ok: false, error: profile.error?.message ?? 'No se pudo crear el perfil' };
      }
      ({ error } = await supabase.from('posts').insert({
        id: post.id,
        author_id: profile.data,
        kind: post.kind,
        category: post.category,
        title: post.title,
        description: post.description,
        sector_id: post.sectorId,
        price_label: post.priceLabel ?? null,
        urgent: post.urgent ?? false,
        available_now: post.availableNow,
        details: post.details ?? [],
        expires_at: new Date(post.expiresAt).toISOString(),
      }));
      break;
    }
    case 'interaction.request': {
      if (!UUID.test(str(p.postId))) {
        return { ok: false, error: 'La publicación de demostración no admite solicitudes reales' };
      }
      ({ error } = await supabase
        .from('post_requests')
        .insert({ id: item.id, post_id: p.postId, requester_id: userId, message: str(p.message) }));
      break;
    }
    case 'moderation.report': {
      if (!UUID.test(str(p.postId))) {
        return { ok: false, error: 'La publicación de demostración no admite reportes reales' };
      }
      ({ error } = await supabase.from('post_reports').insert({
        id: item.id,
        post_id: p.postId,
        reporter_id: userId,
        reason: str(p.reason),
        note: str(p.note) || null,
      }));
      break;
    }
    case 'emergency.help':
    case 'emergency.incident': {
      const help = item.type === 'emergency.help';
      ({ error } = await supabase.from('emergency_reports').insert({
        id: str(p.reportId),
        user_id: userId,
        device_id: item.deviceId,
        kind: help ? 'help' : 'incident',
        category: str(help ? p.type : p.category),
        immediate_danger: Boolean(p.immediateDanger),
        sector_id: str(p.sectorId),
        ...(p.peopleCount ? { people_count: str(p.peopleCount) } : {}),
        ...(p.peopleAtRisk ? { people_at_risk: str(p.peopleAtRisk) } : {}),
      }));
      break;
    }
    case 'emergency.vulnerable': {
      ({ error } = await supabase.from('vulnerable_alerts').insert({
        id: str(p.alertId),
        user_id: userId,
        need: str(p.need),
        basis: str(p.basis),
        sector_id: str(p.sectorId),
      }));
      break;
    }
    case 'resource.offer': {
      ({ error } = await supabase.from('resource_offers').insert({
        id: str(p.offerId),
        user_id: userId,
        resource: str(p.resource),
        sector_id: str(p.sectorId),
        quantity: typeof p.quantity === 'number' ? p.quantity : null,
      }));
      break;
    }
    case 'resource.update': {
      // La fila debe existir (la oferta sale antes: misma prioridad y más antigua). Si no, se reintenta.
      const updated = await supabase.rpc('update_my_offer', {
        p_id: str(p.offerId),
        p_quantity: typeof p.quantity === 'number' ? p.quantity : null,
        p_delivered: typeof p.delivered === 'number' ? p.delivered : null,
        p_cancel: p.cancel === true,
      });
      if (updated.error) return { ok: false, error: updated.error.message };
      return { ok: true, status: 'received' };
    }
  }

  if (error && error.code !== DUPLICATE_KEY) return { ok: false, error: error.message };
  return { ok: true, status: 'received' };
}

export const supabaseTransport: SyncTransport = {
  name: 'supabase',
  send: async (item) => {
    try {
      return await sendToServer(item);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Error al enviar' };
    }
  },
};

/** Activa Supabase como transporte si hay variables de entorno; si no, queda «sin servidor». */
export function registerSupabaseTransport() {
  if (isSupabaseConfigured) setTransport(supabaseTransport);
}
