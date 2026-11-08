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

/** Conversación entre dos vecinos sobre una publicación (SPEC-045: se abre con «Escribir»). */
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
  /** Hay un bloqueo entre los dos (en cualquier sentido): ya no se puede escribir. */
  blocked: boolean;
  /** El último mensaje lo escribí yo (no cuenta como «sin leer», SPEC-048). */
  lastFromMe: boolean;
};

export const MAX_MESSAGE_LENGTH = 500;
