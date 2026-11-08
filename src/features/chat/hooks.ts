import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { useSessionStore } from '@/features/session';
import { isSupabaseConfigured } from '@/shared/supabase/client';

import { fetchConversations, fetchMessages, startConversation } from './chatRepository';
import { useLocalMessagesStore } from './localMessages';
import { chatModeFor, mergeMessages, type ChatPostTarget } from './logic';
import { demoSeedMessage } from './demo';
import type { ChatMessage, Conversation } from './types';

/** Conversación de demostración por defecto: se ofrece cuando todavía no tienes ninguna otra. */
export const DEMO_CONVERSATION_ID = 'demo-conv-1';

export const chatKeys = {
  conversations: ['chat', 'conversations'] as const,
  messages: (id: string) => ['chat', 'messages', id] as const,
};

export const isDemoConversation = (id: string) => id.startsWith('demo-conv-');

/**
 * Bandeja: conversaciones reales (servidor, se refrescan solas) y las de demostración abiertas en este teléfono.
 * Si no hay ninguna, se ofrece una de demostración para probar el chat. Lo bloqueado aquí se marca al instante.
 */
export function useConversations() {
  const local = useLocalMessagesStore((s) => s.messages);
  const demoConversations = useLocalMessagesStore((s) => s.demoConversations);
  const blockedIds = useLocalMessagesStore((s) => s.blockedConversationIds);
  const query = useQuery({
    queryKey: chatKeys.conversations,
    queryFn: fetchConversations,
    refetchInterval: 10_000,
    enabled: isSupabaseConfigured,
  });

  const conversations = useMemo<Conversation[]>(() => {
    const lastLocal = (id: string) => local.filter((m) => m.conversationId === id).at(-1);
    const withLocal = (c: Conversation): Conversation => {
      const last = c.isDemo ? lastLocal(c.id) : undefined;
      return {
        ...c,
        lastBody: last?.body ?? c.lastBody,
        lastAt: last?.createdAt ?? c.lastAt,
        lastFromMe: last ? last.mine : c.lastFromMe,
        blocked: c.blocked || blockedIds.includes(c.id),
      };
    };
    const real = isSupabaseConfigured ? (query.data ?? []) : [];
    const all = [...real, ...demoConversations];
    if (all.length === 0) {
      all.push({
        id: DEMO_CONVERSATION_ID,
        postId: 'demo',
        postTitle: 'Escalera telescópica en préstamo',
        otherName: 'Carlos V. (demo)',
        lastBody: 'Toca para probar el chat de demostración.',
        lastAt: 0,
        isDemo: true,
        blocked: false,
        lastFromMe: true,
      });
    }
    return all.map(withLocal).sort((a, b) => b.lastAt - a.lastAt);
  }, [query.data, demoConversations, local, blockedIds]);

  return { conversations, isLoading: isSupabaseConfigured && query.isLoading, refetch: query.refetch };
}

/** Lo que «Escribir» necesita saber de una publicación (sin depender de `features/posts`). */
export type StartChatTarget = ChatPostTarget & { title: string; author: { displayName: string } };

/**
 * SPEC-045: «Escribir» abre (o reutiliza) la conversación. Con servidor y publicación real, la crea el servidor;
 * si no, abre una conversación de demostración local. Devuelve el id para navegar.
 */
export function useStartChat() {
  const client = useQueryClient();
  const openDemo = useLocalMessagesStore((s) => s.openDemoConversation);
  return useMutation({
    mutationFn: async (post: StartChatTarget): Promise<string> => {
      if (chatModeFor(post, isSupabaseConfigured) === 'demo') {
        return openDemo({ postId: post.id, postTitle: post.title, otherName: `${post.author.displayName} (demo)` });
      }
      return startConversation(post.id, useSessionStore.getState().displayName);
    },
    onSuccess: () => void client.invalidateQueries({ queryKey: chatKeys.conversations }),
  });
}

/**
 * Mensajes de una conversación: lo del servidor (cada 4 s mientras está abierta) más lo escrito en este
 * teléfono que aún no llegó. Cuando el servidor confirma un mensaje, se quita de lo local.
 */
export function useMessages(conversationId: string) {
  const isDemo = isDemoConversation(conversationId);
  const local = useLocalMessagesStore((s) => s.messages);
  const dropConfirmed = useLocalMessagesStore((s) => s.dropConfirmed);

  const query = useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: () => fetchMessages(conversationId),
    refetchInterval: 4_000,
    enabled: isSupabaseConfigured && !isDemo,
  });

  const serverMessages = query.data;
  useEffect(() => {
    if (serverMessages) dropConfirmed(serverMessages.map((m) => m.id));
  }, [serverMessages, dropConfirmed]);

  const [seed] = useState(() => demoSeedMessage(DEMO_CONVERSATION_ID));
  const messages = useMemo<ChatMessage[]>(
    () =>
      mergeMessages(
        serverMessages ?? [],
        [...(conversationId === DEMO_CONVERSATION_ID ? [seed] : []), ...local.filter((m) => m.conversationId === conversationId)],
      ),
    [serverMessages, local, conversationId, seed],
  );

  return { messages, isLoading: query.isLoading && !isDemo, isError: query.isError, isDemo };
}
