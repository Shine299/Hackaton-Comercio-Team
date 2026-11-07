import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useBoardNotifications } from './useBoardNotifications';

/** No dibuja nada: avisa de lo nuevo en el sector y abre el tablero si se toca la notificación. */
export function BoardNotifier() {
  const router = useRouter();
  useBoardNotifications();

  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!response) return;
    const id = response.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;
    if (response.notification.request.content.data?.target === 'board') {
      router.push('/emergencias/tablero');
    }
  }, [response, router]);

  return null;
}
