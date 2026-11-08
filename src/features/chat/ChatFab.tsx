import { usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/features/onboarding';
import { chatFabVisible } from '@/features/shell';
import { useBarStore } from '@/shared/nav/barStore';
import { useChatBadgeStore } from '@/shared/nav/chatBadgeStore';
import { Icon, PressableScale, Text, TourTarget } from '@/shared/ui';

/**
 * Burbuja de chat (SPEC-051), abajo a la derecha del Inicio, Comunidad, Negocios y Ayuda. Abre la bandeja de
 * mensajes y muestra cuántas conversaciones tienes sin leer (número + texto para el lector, no solo color).
 * Se dibuja dentro del área de contenido, así que queda por encima de la barra inferior; en el Inicio (sin barra)
 * sube lo que mide el área segura de abajo.
 */
export function ChatFab() {
  const router = useRouter();
  const pathname = usePathname();
  const completed = useOnboardingStore((s) => s.completed);
  const unread = useChatBadgeStore((s) => s.unread);
  const insets = useSafeAreaInsets();
  const barVisible = useBarStore((s) => s.visible);

  if (!completed || !chatFabVisible(pathname)) return null;

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', right: 16, bottom: 16 + (barVisible ? 0 : insets.bottom), zIndex: 50 }}>
      <TourTarget id="chat-fab">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={unread > 0 ? `Abrir mensajes, ${unread} sin leer` : 'Abrir mensajes'}
          onPress={() => router.push('/mensajes')}
          className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg elevation-md">
          <Icon name="message-text" size={30} color="onPrimary" />
          {unread > 0 ? (
            <View className="absolute -right-1 -top-1 h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-1">
              <Text variant="label-sm" tone="onSecondary">
                {unread > 9 ? '9+' : unread}
              </Text>
            </View>
          ) : null}
        </PressableScale>
      </TourTarget>
    </View>
  );
}
