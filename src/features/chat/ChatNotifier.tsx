import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { notifyLocal } from '@/features/notifications';

import { useLocalMessagesStore } from './localMessages';
import { freshUnread } from './unread';
import { useChatUnread } from './useChatUnread';

/**
 * No dibuja nada (SPEC-048): mantiene el número de la pestaña Chat y avisa con una notificación LOCAL cuando llega un
 * mensaje nuevo de otra persona y no estás en ese chat. No muestra el texto del mensaje (podría verse con el teléfono
 * bloqueado). Lo que ya estaba sin leer al abrir la app no notifica.
 */
export function ChatNotifier() {
  const router = useRouter();
  const unread = useChatUnread();
  const previous = useRef<Record<string, number> | null>(null);

  useEffect(() => {
    const current = Object.fromEntries(unread.map((c) => [c.id, c.lastAt]));
    const fresh = freshUnread(previous.current, current);
    previous.current = current;
    const open = useLocalMessagesStore.getState().openConversationId;
    for (const conversation of unread.filter((c) => fresh.includes(c.id) && c.id !== open).slice(0, 3)) {
      void notifyLocal({
        title: `Nuevo mensaje de ${conversation.otherName}`,
        body: `Sobre «${conversation.postTitle}». Toca para leerlo en Yunta.`,
        data: { target: 'chat', conversationId: conversation.id },
      });
    }
  }, [unread]);

  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!response) return;
    const id = response.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;
    const data = response.notification.request.content.data;
    if (data?.target === 'chat' && typeof data.conversationId === 'string') {
      router.push({ pathname: '/chat/[id]', params: { id: data.conversationId } });
    }
  }, [response, router]);

  return null;
}
