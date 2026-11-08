import type { ChatMessage } from './types';

/** Datos de demostración del chat: ficticios, sin servidor, siempre marcados como demo. */

/** Primer mensaje de la persona de la demo, para que el chat por defecto no empiece vacío. */
export function demoSeedMessage(conversationId: string): ChatMessage {
  return {
    id: 'demo-seed-1',
    conversationId,
    body: '¡Hola! Vi tu publicación. ¿Sigue disponible?',
    createdAt: Date.now() - 5 * 60_000,
    mine: false,
  };
}
