import type { SyncStatus } from '@/shared/sync/status';

/** Mensaje de una conversación. `mine` = lo escribió esta persona. */
export type ChatMessage = {
  id: string;
  conversationId: string;
  body: string;
  createdAt: number;
  mine: boolean;
  /** Solo en mensajes propios que aún no confirmó el servidor. */
  syncStatus?: SyncStatus;
};

/** Conversación abierta tras aceptar una solicitud de contacto. */
export type Conversation = {
  id: string;
  postId: string;
  postTitle: string;
  /** Nombre público de la otra persona (nunca teléfono ni correo). */
  otherName: string;
  lastBody: string;
  lastAt: number;
  /** `true` para la conversación de demostración (respuestas guionadas, sin servidor). */
  isDemo: boolean;
};

/** Solicitud de contacto que recibió el dueño de una publicación y debe aceptar o rechazar. */
export type PendingRequest = {
  id: string;
  postId: string;
  postTitle: string;
  message: string;
  requesterName: string;
  createdAt: number;
};

export const MAX_MESSAGE_LENGTH = 500;
