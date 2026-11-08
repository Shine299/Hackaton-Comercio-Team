import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGoBack } from '@/shared/nav/useGoBack';

import { Icon } from './Icon';
import { Text } from './Text';

type ScreenHeaderProps = {
  title: string;
  /** Texto del botón de volver para lectores de pantalla. */
  backLabel?: string;
  /** Acción a la derecha (guardar, menú…). */
  trailing?: ReactNode;
};

/** Cabecera simple para pantallas de detalle (volver + título). */
export function ScreenHeader({ title, backLabel = 'Volver', trailing }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const goBack = useGoBack();

  return (
    <View
      className="flex-row items-center gap-2 border-b border-outline-variant bg-surface px-2 pb-2"
      style={{ paddingTop: insets.top + 8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={goBack}
        className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-container">
        <Icon name="arrow-left" size={24} color="onSurface" />
      </Pressable>
      <Text variant="headline-sm" className="flex-1" numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      {trailing ?? <View className="h-12 w-12" />}
    </View>
  );
}
