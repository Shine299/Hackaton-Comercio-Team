import { useChatUnread } from './useChatUnread';

/** Vista previa web: solo el número de la pestaña Chat (sin notificaciones locales). */
export function ChatNotifier() {
  useChatUnread();
  return null;
}
