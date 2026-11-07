import { Pressable } from 'react-native';

import { Icon } from '@/shared/ui';

type Props = {
  icon: 'target' | 'arrow-expand' | 'arrow-collapse';
  label: string;
  onPress: () => void;
};

/** Botón flotante sobre el mapa (recentrar en el sector, ampliar). No usa la ubicación del dispositivo. */
export function MapFab({ icon, label, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest shadow-md elevation-sm active:opacity-80">
      <Icon name={icon} size={24} color="primary" />
    </Pressable>
  );
}
