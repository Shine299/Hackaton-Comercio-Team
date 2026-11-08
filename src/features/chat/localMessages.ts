import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useOutboxStore } from '@/features/outbox';
import { kvStorage } from '@/shared/storage/kv';
import type { SyncStatus } from '@/shared/sync/status';

import type { ChatMessage } from './types';

/** Mensaje guardado en este teléfono: lo propio que aún no llegó, y las respuestas guionadas de la demo. */
type LocalMessage = ChatMessage & { fromDemo?: boolean };

type LocalMessagesState = {
  messages: LocalMessage[];
  /** La solicitud de demostración ya se aceptó o rechazó. */
  demoRequestHandled: boolean;
  handleDemoRequest: () => void;
  /** Guarda un mensaje propio y lo pone en la cola de envío. Devuelve el mensaje creado. */
  send: (conversationId: string, body: string, options?: { demo?: boolean }) => ChatMessage;
  /** Respuesta de la otra persona en la conversación de demostración (nunca sale del teléfono). */
  addDemoReply: (conversationId: string, body: string) => void;
  /** Estado de envío por id de mensaje, según la cola. */
  setSyncStatus: (statuses: Record<string, SyncStatus>) => void;
  /** Quita lo que el servidor ya confirmó. */
  dropConfirmed: (ids: string[]) => void;
};

export const useLocalMessagesStore = create<LocalMessagesState>()(
  persist(
    (set) => ({
      messages: [],
      demoRequestHandled: false,
      handleDemoRequest: () => set({ demoRequestHandled: true }),
      send: (conversationId, body, options) => {
        const id = Crypto.randomUUID();
        const message: LocalMessage = {
          id,
          conversationId,
          body,
          createdAt: Date.now(),
          mine: true,
          // En la demo no hay servidor: nunca se simula «recibido».
          syncStatus: 'local',
          fromDemo: options?.demo,
        };
        // El id del mensaje viaja en el envío y es la clave en el servidor: reintentar no lo duplica.
        if (!options?.demo) {
          useOutboxStore.getState().enqueue('chat.message', { messageId: id, conversationId, body }, 'normal');
        }
        set((state) => ({ messages: [...state.messages, message] }));
        return message;
      },
      addDemoReply: (conversationId, body) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { id: Crypto.randomUUID(), conversationId, body, createdAt: Date.now(), mine: false, fromDemo: true },
          ],
        })),
      setSyncStatus: (statuses) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.mine && statuses[m.id] ? { ...m, syncStatus: statuses[m.id] } : m)),
        })),
      dropConfirmed: (ids) => {
        if (ids.length === 0) return;
        const confirmed = new Set(ids);
        set((state) => ({ messages: state.messages.filter((m) => m.fromDemo || !confirmed.has(m.id)) }));
      },
    }),
    { name: 'yunta.chat-local.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);
