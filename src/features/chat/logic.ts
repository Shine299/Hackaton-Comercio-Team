import { MAX_MESSAGE_LENGTH, type ChatMessage } from './types';

/**
 * El chat solo se abre tras aceptar la solicitud: antes de eso nadie puede escribirle a nadie.
 * (Regla de producto: «solicitud antes del contacto».)
 */
export function canOpenChat(request: { status: 'received' | 'accepted' | 'declined' }): boolean {
  return request.status === 'accepted';
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
