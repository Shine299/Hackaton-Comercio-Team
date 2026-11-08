import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

import type { Answer } from './logic';

export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  /** Lo guardado es lo que se envió: la pregunta ya sin datos personales. */
  text: string;
  createdAt: number;
  /** Solo en respuestas. */
  answer?: Omit<Answer, 'text'>;
};

type AssistantState = {
  messages: AssistantMessage[];
  add: (message: Omit<AssistantMessage, 'id' | 'createdAt'>) => void;
  clear: () => void;
};

/** La conversación con el asistente se guarda solo en este teléfono (el servidor no guarda mensajes). */
export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      messages: [],
      add: (message) =>
        set((state) => ({
          // Se conservan las últimas 60: es una ayuda, no un archivo.
          messages: [...state.messages, { ...message, id: Crypto.randomUUID(), createdAt: Date.now() }].slice(-60),
        })),
      clear: () => set({ messages: [] }),
    }),
    { name: 'yunta.assistant.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);
