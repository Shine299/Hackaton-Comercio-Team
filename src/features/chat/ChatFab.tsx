import { usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';

import { useOnboardingStore } from '@/features/onboarding';
import { ROOT_PATHS } from '@/features/shell';
import { Icon, PressableScale, Text, TourTarget } from '@/shared/ui';

import { usePendingRequests } from './hooks';

/**
 * Botón redondo de chat, abajo a la derecha de las pantallas principales. Muestra cuántas solicitudes esperan
 * respuesta (la de demostración incluida, hasta que se atiende).
 */
export function ChatFab() {
  const router = useRouter();
  const pathname = usePathname();
  const completed = useOnboardingStore((s) => s.completed);
  const { data: pending = [] } = usePendingRequests();

  if (!completed || !ROOT_PATHS.has(pathname)) return null;

  const waiting = pending.length;

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 50 }}>
      <TourTarget id="chat-fab">
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={waiting > 0 ? `Abrir mensajes, ${waiting} por responder` : 'Abrir mensajes'}
        onPress={() => router.push('/mensajes')}
        className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg elevation-md">
        <Icon name="message-text" size={30} color="onPrimary" />
        {waiting > 0 ? (
          <View className="absolute -right-1 -top-1 h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-1">
            <Text variant="label-sm" tone="onSecondary">
              {waiting > 9 ? '9+' : waiting}
            </Text>
          </View>
        ) : null}
      </PressableScale>
      </TourTarget>
    </View>
  );
}
