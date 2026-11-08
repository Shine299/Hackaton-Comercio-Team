import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

export const CHANNEL_ID = 'avisos-del-sector';

// Muestra la notificación aunque la app esté abierta, sin sonido molesto ni insignia.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Pide permiso (y crea el canal en Android). `false` si se niega: la app sigue igual. */
export async function ensurePermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      // En Android 13+ el permiso no se pide hasta que exista un canal.
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Avisos de tu sector',
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.status === 'granted';
  } catch {
    return false;
  }
}

/** Notificación LOCAL inmediata (no es push remoto). Si no hay permiso, no hace nada. */
export async function notifyLocal(content: { title: string; body: string; data: Record<string, string> }): Promise<void> {
  if (!(await ensurePermission())) return;
  await Notifications.scheduleNotificationAsync({ content, trigger: { channelId: CHANNEL_ID } });
}
