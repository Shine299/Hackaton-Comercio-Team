import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGoBack } from '@/shared/nav/useGoBack';
import { Icon, Text } from '@/shared/ui';

type BackHeaderProps = {
  label?: string;
  trailing?: ReactNode;
};

/** Cabecera de pantallas que se abren desde una sección: solo «Atrás», sobre el fondo de la pantalla. */
export function BackHeader({ label = 'Atrás', trailing }: BackHeaderProps) {
  const insets = useSafeAreaInsets();
  const goBack = useGoBack();

  return (
    <View className="flex-row items-center justify-between bg-surface-container-low px-3 pb-1" style={{ paddingTop: insets.top + 8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label === 'Atrás' ? 'Volver' : label}
        onPress={goBack}
        className="min-h-11 flex-row items-center gap-0.5 pr-3 active:opacity-70">
        <Icon name="chevron-left" size={26} color="primary" />
        <Text variant="body-lg-bold" tone="primary">
          {label}
        </Text>
      </Pressable>
      {trailing}
    </View>
  );
}
