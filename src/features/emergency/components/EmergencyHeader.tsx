import { useRouter } from 'expo-router';
import { Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Text } from '@/shared/ui';

type EmergencyHeaderProps = {
  title?: string;
  /** Si es una subpantalla de Emergencia, vuelve atrás; si no, sale al Inicio. */
  backToCenter?: boolean;
};

/**
 * Cabecera de las subpantallas de Emergencia (referencia: lienzo). Siempre ofrece una salida clara
 * y el acceso al 116; nunca bloquea el acceso por tutorial o registro.
 */
export function EmergencyHeader({ backToCenter = false }: EmergencyHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/emergencias');
  };

  return (
    <View className="flex-row items-center justify-between bg-surface-container-low px-3 pb-1" style={{ paddingTop: insets.top + 8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backToCenter ? 'Volver' : 'Salir de Emergencia'}
        onPress={goBack}
        className="min-h-11 flex-row items-center gap-0.5 pr-3 active:opacity-70">
        <Icon name="chevron-left" size={26} color="primary" />
        <Text variant="body-lg-bold" tone="primary">
          {backToCenter ? 'Atrás' : 'Salir'}
        </Text>
      </Pressable>
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Llamar al 116, Bomberos"
          onPress={() => void Linking.openURL('tel:116')}
          className="h-10 flex-row items-center gap-1.5 rounded-full bg-error-container px-3.5 active:opacity-80">
          <Icon name="phone" size={18} color="onErrorContainer" />
          <Text variant="label-md" tone="error">
            Llamar 116
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
