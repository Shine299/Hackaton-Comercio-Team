import { Linking, Pressable, View } from 'react-native';

import { Card, Icon, Text } from '@/shared/ui';

import { EMERGENCY_NUMBERS, formatReviewDate } from '../emergencyNumbers';

/** Servicios oficiales. Números configurables, con aviso de que hay que confirmarlos. */
export function EmergencyNumbersCard() {
  const config = EMERGENCY_NUMBERS;
  return (
    <Card tone="low">
      <View className="flex-row items-center gap-2">
        <Icon name="phone-alert-outline" size={22} color="error" />
        <Text variant="body-lg-bold">Servicios oficiales</Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {config.entries.map((entry) => (
          <Pressable
            key={entry.id}
            accessibilityRole="button"
            accessibilityLabel={`Llamar a ${entry.label}, número ${entry.number.split('').join(' ')}`}
            onPress={() => void Linking.openURL(`tel:${entry.number}`)}
            className="min-h-14 min-w-28 flex-1 items-center justify-center rounded-xl bg-error px-3 py-2 active:opacity-80">
            <Text variant="headline-sm" tone="onError">
              {entry.number}
            </Text>
            <Text variant="label-sm" tone="onError">
              {entry.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text variant="label-md" tone="muted">
        Números configurados para {config.territory}, revisados el {formatReviewDate(config.reviewedAt)}.
        La app no los verifica: confírmalos con tu municipalidad.
      </Text>
    </Card>
  );
}
