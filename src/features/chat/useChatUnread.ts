import { useEffect, useMemo } from 'react';

import { useChatBadgeStore } from '@/shared/nav/chatBadgeStore';

import { useConversations } from './hooks';
import { useLocalMessagesStore } from './localMessages';
import { unreadConversationIds } from './unread';

/** Conversaciones sin leer (SPEC-048) y copia del número para la pestaña Chat. */
export function useChatUnread() {
  const { conversations } = useConversations();
  const lastReadAt = useLocalMessagesStore((s) => s.lastReadAt);
  const readSince = useLocalMessagesStore((s) => s.readSince);
  const setUnread = useChatBadgeStore((s) => s.setUnread);

  const unread = useMemo(() => {
    const ids = new Set(unreadConversationIds(conversations, lastReadAt, readSince));
    return conversations.filter((c) => ids.has(c.id));
  }, [conversations, lastReadAt, readSince]);

  useEffect(() => setUnread(unread.length), [unread.length, setUnread]);
  return unread;
}
