import { Pressable, View } from 'react-native';

import { useEasyMode } from '@/shared/nav/viewModeStore';

import { cn } from './cn';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** `radio` para grupos de una sola opción; `checkbox` para filtros combinables. */
  role?: 'radio' | 'checkbox';
  accessibilityLabel?: string;
};

/**
 * Chip seleccionable para filtros. El estado seleccionado no depende solo del color:
 * cambia el fondo, el borde y aparece un check.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  role = 'checkbox',
  accessibilityLabel,
}: ChipProps) {
  const easy = useEasyMode();
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: selected, selected }}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-1.5 rounded-full border-2 px-3.5 active:opacity-80',
        easy ? 'min-h-14 px-5' : 'min-h-11',
        selected ? 'border-primary bg-primary' : 'border-transparent bg-surface-container-lowest shadow-sm elevation-xs',
      )}>
      {selected ? (
        <View>
          <Icon name="check" size={16} color="onPrimary" />
        </View>
      ) : icon ? (
        <View>
          <Icon name={icon} size={16} color="onSurfaceVariant" />
        </View>
      ) : null}
      <Text variant="label-md" tone={selected ? 'onPrimary' : 'default'}>
        {label}
      </Text>
    </Pressable>
  );
}
