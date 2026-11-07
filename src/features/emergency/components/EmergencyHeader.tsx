import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Text } from '@/shared/ui';

type EmergencyHeaderProps = {
  title?: string;
  /** Si es una subpantalla de Emergencias, vuelve atrás; si no, sale al modo Día a Día. */
  backToCenter?: boolean;
};

/**
 * Cabecera del Modo Emergencia (referencia: Stitch «Centro de emergencias»).
 * Siempre ofrece una salida clara; nunca bloquea el acceso por tutorial o registro.
 */
export function EmergencyHeader({
  title = 'Modo Emergencia',
  backToCenter = false,
}: EmergencyHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View className="bg-error px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backToCenter ? 'Volver al Centro de emergencias' : 'Salir del Modo Emergencia'}
          onPress={goBack}
          className="min-h-12 flex-row items-center gap-1 rounded-full bg-white/20 px-3 active:opacity-80">
          <Icon name="arrow-left" size={20} color="onError" />
          <Text variant="body-md-medium" tone="onError">
            {backToCenter ? 'Volver' : 'Salir'}
          </Text>
        </Pressable>
        <View className="flex-1 items-end">
          <Text variant="headline-sm" tone="onError" numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
}
