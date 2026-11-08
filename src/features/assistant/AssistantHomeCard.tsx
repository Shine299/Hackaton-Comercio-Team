import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { BrandLogo, Icon, PressableScale, Text } from '@/shared/ui';

/**
 * «Habla con Yunta» — lo primero del Inicio (SPEC-053). Abre la conversación por voz: Yunta saluda y cuenta un resumen
 * de lo que hay en el barrio, y después conversan.
 */
export function AssistantHomeCard() {
  const router = useRouter();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="Habla con Yunta. Te cuenta lo que pasa en tu barrio y resuelve tus dudas con tu voz"
      onPress={() => router.push({ pathname: '/conversacion', params: { t: String(Date.now()) } })}
      className="min-h-20 flex-row items-center gap-3 rounded-3xl bg-surface-container-lowest p-3 pr-4 shadow-md elevation-sm">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed">
        <BrandLogo variant="mark" height={44} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="headline-sm">Habla con Yunta</Text>
        <Text variant="label-md" tone="muted">
          Te cuento lo que pasa en tu barrio y resolvemos tus dudas, con tu voz.
        </Text>
      </View>
      <Icon name="microphone-outline" size={26} color="primary" />
    </PressableScale>
  );
}
