import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured } from '@/shared/supabase/client';

import { acceptRequest, declineRequest, fetchConversations, fetchMessages, fetchPendingRequests } from './chatRepository';
import { useLocalMessagesStore } from './localMessages';
import { mergeMessages } from './logic';
import { demoPendingRequest, demoSeedMessage } from './demo';
import type { ChatMessage, Conversation, PendingRequest } from './types';

/** Conversación de demostración: existe solo cuando no hay servidor, con respuestas guionadas. */
export const DEMO_CONVERSATION_ID = 'demo-conv-1';

export const chatKeys = {
  conversations: ['chat', 'conversations'] as const,
  pending: ['chat', 'pending'] as const,
  messages: (id: string) => ['chat', 'messages', id] as const,
};

/** Bandeja de conversaciones. Con servidor se refresca sola; sin servidor aparece la de demostración. */
export function useConversations() {
  const local = useLocalMessagesStore((s) => s.messages);
  const demoHandled = useLocalMessagesStore((s) => s.demoRequestHandled);
  const query = useQuery({
    queryKey: chatKeys.conversations,
    queryFn: fetchConversations,
    refetchInterval: 10_000,
    enabled: isSupabaseConfigured,
  });

  const conversations = useMemo<Conversation[]>(() => {
    const real = isSupabaseConfigured ? (query.data ?? []) : [];
    // La conversación de demostración se ofrece una vez atendida la solicitud demo (o si no hay servidor).
    if (isSupabaseConfigured && !demoHandled) return real;
    const mine = local.filter((m) => m.conversationId === DEMO_CONVERSATION_ID);
    const last = mine[mine.length - 1];
    return [
      ...real,
      {
        id: DEMO_CONVERSATION_ID,
        postId: 'demo',
        postTitle: 'Escalera telescópica en préstamo',
        otherName: 'Carlos V. (demo)',
        lastBody: last?.body ?? 'Toca para probar el chat de demostración.',
        lastAt: last?.createdAt ?? 0,
        isDemo: true,
      },
    ];
  }, [query.data, local, demoHandled]);

  return { conversations, isLoading: isSupabaseConfigured && query.isLoading, refetch: query.refetch };
}

/** Solicitudes por responder (para quien publicó). */
export function usePendingRequests() {
  const query = useQuery({
    queryKey: chatKeys.pending,
    queryFn: fetchPendingRequests,
    refetchInterval: 15_000,
    enabled: isSupabaseConfigured,
  });
  const demoHandled = useLocalMessagesStore((s) => s.demoRequestHandled);
  // Con servidor, la solicitud de demostración se muestra además de las reales (para enseñar el flujo).
  const data = useMemo<PendingRequest[]>(
    () => [...(demoHandled || !isSupabaseConfigured ? [] : [demoPendingRequest()]), ...(query.data ?? [])],
    [query.data, demoHandled],
  );
  return { ...query, data };
}

/** Aceptar abre la conversación; rechazar la descarta. Ambas refrescan bandeja y solicitudes. */
export function useRespondToRequest() {
  const client = useQueryClient();
  const refresh = () => {
    void client.invalidateQueries({ queryKey: chatKeys.pending });
    void client.invalidateQueries({ queryKey: chatKeys.conversations });
  };
  const accept = useMutation({ mutationFn: acceptRequest, onSuccess: refresh });
  const decline = useMutation({ mutationFn: declineRequest, onSuccess: refresh });
  return { accept, decline };
}

/**
 * Mensajes de una conversación: lo del servidor (cada 4 s mientras está abierta) más lo escrito en este
 * teléfono que aún no llegó. Cuando el servidor confirma un mensaje, se quita de lo local.
 */
export function useMessages(conversationId: string) {
  const isDemo = conversationId === DEMO_CONVERSATION_ID;
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
        [...(isDemo ? [seed] : []), ...local.filter((m) => m.conversationId === conversationId)],
      ),
    [serverMessages, local, conversationId, isDemo, seed],
  );

  return { messages, isLoading: query.isLoading && !isDemo, isError: query.isError, isDemo };
}
