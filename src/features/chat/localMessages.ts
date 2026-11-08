import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useOutboxStore } from '@/features/outbox';
import { kvStorage } from '@/shared/storage/kv';
import type { SyncStatus } from '@/shared/sync/status';

import { demoConversationIdFor } from './logic';
import type { ChatMessage, Conversation } from './types';

/** Mensaje guardado en este teléfono: lo propio que aún no llegó, y las respuestas guionadas de la demo. */
type LocalMessage = ChatMessage & { fromDemo?: boolean };

type LocalMessagesState = {
  messages: LocalMessage[];
  /** Conversaciones de demostración abiertas con «Escribir» (SPEC-045). Nunca salen del teléfono. */
  demoConversations: Conversation[];
  /** Conversaciones donde bloqueaste a la otra persona (se oculta la caja para escribir al instante). */
  blockedConversationIds: string[];
  /** Mensajes que reportaste, con su estado de envío (nunca «recibido» sin servidor). */
  reportedMessages: Record<string, SyncStatus>;
  /** Última vez que abrí cada conversación (SPEC-048: sin leer). */
  lastReadAt: Record<string, number>;
  /** Desde cuándo se cuenta «sin leer»: lo anterior a esta versión no se marca. */
  readSince: number;
  /** Conversación abierta ahora (no se guarda): sus mensajes no notifican. */
  openConversationId: string | null;
  markRead: (conversationId: string) => void;
  setOpenConversation: (conversationId: string | null) => void;
  /** Abre (o reutiliza) la conversación de demostración de una publicación. Devuelve su id. */
  openDemoConversation: (target: { postId: string; postTitle: string; otherName: string }) => string;
  /** Guarda un mensaje propio y lo pone en la cola de envío. Devuelve el mensaje creado. */
  send: (conversationId: string, body: string, options?: { demo?: boolean }) => ChatMessage;
  /** Respuesta de la otra persona en la conversación de demostración (nunca sale del teléfono). */
  addDemoReply: (conversationId: string, body: string) => void;
  /** Bloquea a la otra persona. En la demo solo queda en el teléfono. */
  block: (conversationId: string, options?: { demo?: boolean }) => void;
  /** Reporta un mensaje de la otra persona. En la demo solo queda en el teléfono. */
  reportMessage: (messageId: string, options?: { demo?: boolean }) => void;
  /** Estado de envío por id de mensaje, según la cola. */
  setSyncStatus: (statuses: Record<string, SyncStatus>) => void;
  /** Estado de envío de los reportes, por id de mensaje. */
  setReportStatus: (statuses: Record<string, SyncStatus>) => void;
  /** Quita lo que el servidor ya confirmó. */
  dropConfirmed: (ids: string[]) => void;
};

export const useLocalMessagesStore = create<LocalMessagesState>()(
  persist(
    (set, get) => ({
      messages: [],
      demoConversations: [],
      blockedConversationIds: [],
      reportedMessages: {},
      lastReadAt: {},
      readSince: Date.now(),
      openConversationId: null,
      markRead: (conversationId) =>
        set((state) => ({ lastReadAt: { ...state.lastReadAt, [conversationId]: Date.now() } })),
      setOpenConversation: (conversationId) => set({ openConversationId: conversationId }),
      openDemoConversation: ({ postId, postTitle, otherName }) => {
        const id = demoConversationIdFor(postId);
        if (!get().demoConversations.some((c) => c.id === id)) {
          const conversation: Conversation = {
            id,
            postId,
            postTitle,
            otherName,
            lastBody: '',
            lastAt: Date.now(),
            isDemo: true,
            blocked: false,
            lastFromMe: true,
          };
          set((state) => ({ demoConversations: [conversation, ...state.demoConversations] }));
        }
        return id;
      },
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
      block: (conversationId, options) => {
        if (get().blockedConversationIds.includes(conversationId)) return;
        if (!options?.demo) useOutboxStore.getState().enqueue('chat.block', { conversationId }, 'normal');
        set((state) => ({ blockedConversationIds: [...state.blockedConversationIds, conversationId] }));
      },
      reportMessage: (messageId, options) => {
        if (get().reportedMessages[messageId]) return;
        if (!options?.demo) {
          useOutboxStore
            .getState()
            .enqueue('chat.report', { reportId: Crypto.randomUUID(), messageId, reason: 'other' }, 'normal');
        }
        set((state) => ({ reportedMessages: { ...state.reportedMessages, [messageId]: 'local' } }));
      },
      setSyncStatus: (statuses) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.mine && statuses[m.id] ? { ...m, syncStatus: statuses[m.id] } : m)),
        })),
      setReportStatus: (statuses) =>
        set((state) => {
          const next = { ...state.reportedMessages };
          for (const [id, status] of Object.entries(statuses)) if (next[id]) next[id] = status;
          return { reportedMessages: next };
        }),
      dropConfirmed: (ids) => {
        if (ids.length === 0) return;
        const confirmed = new Set(ids);
        set((state) => ({ messages: state.messages.filter((m) => m.fromDemo || !confirmed.has(m.id)) }));
      },
    }),
    {
      name: 'yunta.chat-local.v1',
      storage: createJSONStorage(() => kvStorage),
      // La conversación abierta es estado de la sesión, no se guarda.
      partialize: ({ openConversationId: _open, ...rest }) => rest,
    },
  ),
);
