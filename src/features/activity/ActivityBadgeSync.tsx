import { useEffect } from 'react';

import { useActivityBadgeStore } from '@/shared/nav/activityBadgeStore';

import { useUnreadActivityCount } from './useUnreadActivityCount';

/** No dibuja nada: copia el contador de avisos sin leer a un almacén compartido para la campana. */
export function ActivityBadgeSync() {
  const unread = useUnreadActivityCount();
  const setUnread = useActivityBadgeStore((s) => s.setUnread);
  useEffect(() => setUnread(unread), [unread, setUnread]);
  return null;
}
