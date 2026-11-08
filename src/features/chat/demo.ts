import type { ChatMessage, PendingRequest } from './types';

/** Datos de demostración del chat: ficticios, sin servidor, siempre marcados como demo. */
export const DEMO_REQUEST_ID = 'demo-request-1';

/** Solicitud de contacto de ejemplo para enseñar el flujo «aceptar y chatear». */
export function demoPendingRequest(): PendingRequest {
  return {
    id: DEMO_REQUEST_ID,
    postId: 'demo',
    postTitle: 'Escalera telescópica en préstamo',
    message: 'Hola, ¿me la prestas este sábado por la mañana?',
    requesterName: 'Rosa M. (demo)',
    createdAt: Date.now() - 20 * 60_000,
  };
}

/** Primer mensaje de la persona de la demo, para que el chat no empiece vacío. */
export function demoSeedMessage(conversationId: string): ChatMessage {
  return {
    id: 'demo-seed-1',
    conversationId,
    body: '¡Hola! Vi tu publicación. ¿Sigue disponible?',
    createdAt: Date.now() - 5 * 60_000,
    mine: false,
  };
}
