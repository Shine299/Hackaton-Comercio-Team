import { View } from 'react-native';

import { PressableScale } from './PressableScale';

import { cn } from './cn';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** Control segmentado (p. ej. Lista / Mapa). Cada opción es un radio accesible. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row gap-1 rounded-2xl bg-surface-container p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected, checked: selected }}
            onPress={() => onChange(option.value)}
            className={cn(
              // `will-change-variable`: evita que NativeWind reinicie el componente al activar la sombra.
              'will-change-variable min-h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl px-3',
              selected && 'bg-surface-container-lowest shadow-sm',
            )}>
            {option.icon ? (
              <View>
                <Icon name={option.icon} size={18} color={selected ? 'primary' : 'onSurfaceVariant'} />
              </View>
            ) : null}
            <Text variant="label-md" tone={selected ? 'primary' : 'muted'}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
