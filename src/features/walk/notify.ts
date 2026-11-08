import * as Notifications from 'expo-notifications';
import { AndroidImportance, SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'acompaname';

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Acompáñame',
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 400, 200, 400],
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return true;
    return (await Notifications.requestPermissionsAsync()).status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Notificación LOCAL a la hora de llegada: «¿Llegaste bien?». Llega aunque la app esté en segundo plano.
 * Devuelve su id para cancelarla al marcar «Llegué bien», o `undefined` si no hay permiso.
 */
export async function scheduleArrivalCheck(seconds: number): Promise<string | undefined> {
  if (!(await ensurePermission())) return undefined;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '¿Llegaste bien?',
        body: 'Se cumplió tu tiempo. Abre Yunta y marca «Llegué bien» o avisa a tus vecinos.',
        data: { target: 'walk' },
      },
      trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, Math.round(seconds)), channelId: CHANNEL_ID },
    });
  } catch {
    return undefined;
  }
}

export async function cancelArrivalCheck(id: string | undefined): Promise<void> {
  if (!id || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Si ya se mostró o no existe, no hay nada que cancelar.
  }
}
