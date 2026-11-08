import { MAX_MESSAGE_LENGTH, type ChatMessage } from './types';

/** Lo mínimo de una publicación para abrir un chat (sin depender de `features/posts`). */
export type ChatPostTarget = { id: string; isOwn?: boolean; status: string; isDemo: boolean };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** SPEC-045: «Escribir» abre el chat sin solicitud previa, en publicaciones activas de otra persona. */
export function canStartChat(post: ChatPostTarget): boolean {
  return !post.isOwn && post.status === 'active';
}

/** Chat real (servidor) o de demostración (local, respuestas guionadas). Nunca se mezcla una demo con el servidor. */
export function chatModeFor(post: ChatPostTarget, serverConfigured: boolean): 'server' | 'demo' {
  return serverConfigured && !post.isDemo && UUID.test(post.id) ? 'server' : 'demo';
}

/** Una sola conversación de demostración por publicación. */
export function demoConversationIdFor(postId: string): string {
  return `demo-conv-${postId}`;
}

export type BodyCheck = { ok: true; body: string } | { ok: false; error: string };

/** Limpia y valida lo que se escribe antes de enviarlo. */
export function checkMessageBody(raw: string): BodyCheck {
  const body = raw.replace(/\s+/g, ' ').trim();
  if (body.length === 0) return { ok: false, error: 'Escribe un mensaje.' };
  if (body.length > MAX_MESSAGE_LENGTH) return { ok: false, error: `Máximo ${MAX_MESSAGE_LENGTH} caracteres.` };
  return { ok: true, body };
}

/**
 * Une lo que dice el servidor con lo que se escribió en este teléfono y aún no llegó. Por id: si el servidor
 * ya lo tiene, gana el del servidor (y deja de verse como «guardado en tu teléfono»). Orden: el más antiguo primero.
 */
export function mergeMessages(server: ChatMessage[], local: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const m of local) byId.set(m.id, m);
  for (const m of server) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
}

/** Respuestas guionadas de la conversación de demostración (sin servidor ni otra persona real). */
const DEMO_REPLIES = [
  '¡Hola! Sí, sigue disponible. ¿Cuándo te viene bien?',
  'Perfecto. Podemos coordinar en la esquina del parque, cerca del local comunal.',
  '¡Genial! Avísame cuando estés por llegar. Gracias por escribir.',
];

/** Siguiente respuesta de demostración según cuántos mensajes tuyos hay; `undefined` cuando se acaban. */
export function demoReply(sentCount: number): string | undefined {
  return DEMO_REPLIES[sentCount - 1];
}

/** Motivos que `start_conversation` explica a la persona (ver la migración de SPEC-045). */
const SERVER_REASONS = [
  'Publicación no encontrada',
  'Esta publicación es de demostración',
  'No puedes escribirte a ti mismo',
  'Esta publicación ya no está activa',
  'No puedes escribir a este vecino',
];

/** Texto para la persona cuando «Escribir» falla. Nunca muestra errores técnicos. */
export function startChatErrorText(message: string): string {
  const reason = SERVER_REASONS.find((r) => message.includes(r));
  return reason ? `${reason}.` : 'No se pudo abrir el chat. Revisa tu conexión e inténtalo de nuevo.';
}
