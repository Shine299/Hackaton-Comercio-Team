import { usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/features/onboarding';
import { assistantFabVisible } from '@/features/shell';
import { useBarStore } from '@/shared/nav/barStore';
import { BrandLogo, PressableScale, TourTarget } from '@/shared/ui';

/**
 * Burbuja flotante del asistente virtual de Yunta (SPEC-051 / SPEC-053), abajo a la derecha de Inicio y de las pestañas.
 * Lleva la mascota de la marca y abre el asistente: escribirle o hablarle. El chat entre vecinos es la pestaña «Chat».
 * Se dibuja dentro del área de contenido, así que queda por encima de la barra inferior; en el Inicio (sin barra)
 * sube lo que mide el área segura de abajo.
 */
export function AssistantFab() {
  const router = useRouter();
  const pathname = usePathname();
  const completed = useOnboardingStore((s) => s.completed);
  const insets = useSafeAreaInsets();
  const barVisible = useBarStore((s) => s.visible);

  if (!completed || !assistantFabVisible(pathname)) return null;

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', right: 16, bottom: 16 + (barVisible ? 0 : insets.bottom), zIndex: 50 }}>
      <TourTarget id="assistant-fab">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Habla con Yunta, tu asistente virtual"
          accessibilityHint="Abre el asistente: puedes escribirle o hablarle"
          onPress={() => router.push('/conversacion')}
          className="h-16 w-16 items-center justify-center rounded-full border-2 border-primary-fixed bg-surface-container-lowest shadow-lg elevation-md">
          <BrandLogo variant="mark" height={40} />
        </PressableScale>
      </TourTarget>
    </View>
  );
}
