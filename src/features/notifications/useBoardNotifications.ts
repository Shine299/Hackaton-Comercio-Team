import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

import { describeSharedItem, useSharedBoard } from '@/features/emergency';
import { useSectorStore } from '@/features/sector';

import { CHANNEL_ID, ensurePermission } from './localNotify';

/**
 * Notificación LOCAL cuando aparece un aviso nuevo de un vecino en tu sector. Funciona mientras la app
 * está abierta o en segundo plano reciente: no es push remoto (eso exige una build de desarrollo y un
 * servidor de envío). Los avisos que ya existían al abrir la app no se notifican; los tuyos tampoco.
 */
export function useBoardNotifications() {
  const sector = useSectorStore((s) => s.sector);
  const { data } = useSharedBoard(sector.id);
  const seen = useRef<Set<string> | null>(null);
  const sectorOf = useRef(sector.id);

  useEffect(() => {
    if (!data) return;
    // Al cambiar de sector, se vuelve a tomar la foto inicial.
    if (sectorOf.current !== sector.id) {
      sectorOf.current = sector.id;
      seen.current = null;
    }
    if (seen.current === null) {
      seen.current = new Set(data.map((i) => i.id));
      return;
    }
    const fresh = data.filter((i) => !seen.current?.has(i.id) && !i.mine && i.status !== 'resolved');
    for (const item of data) seen.current.add(item.id);
    if (fresh.length === 0) return;

    void (async () => {
      if (!(await ensurePermission())) return;
      for (const item of fresh.slice(0, 3)) {
        const { title } = describeSharedItem(item, sector.name);
        const priority = item.source === 'vulnerable' || item.immediateDanger;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: priority ? 'Un vecino podría necesitar ayuda' : 'Nuevo aviso en tu sector',
            body: `${title} Toca para ver el tablero y, si puedes, ayudar.`,
            data: { target: 'board' },
          },
          // Entrega inmediata por el canal de alta prioridad (en iOS el canal se ignora).
          trigger: { channelId: CHANNEL_ID },
        });
      }
    })();
  }, [data, sector.id, sector.name]);
}
