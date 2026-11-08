import { create } from 'zustand';

type ChatBadgeState = {
  /** Conversaciones sin leer (lo calcula `ChatNotifier` en `features/chat`; lo lee la barra de `shell`). */
  unread: number;
  setUnread: (unread: number) => void;
};

export const useChatBadgeStore = create<ChatBadgeState>((set) => ({
  unread: 0,
  setUnread: (unread) => set((state) => (state.unread === unread ? state : { unread })),
}));
