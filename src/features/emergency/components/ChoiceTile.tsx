import { Pressable, View } from 'react-native';

import { cn, Icon, Text, type IconName } from '@/shared/ui';

type ChoiceTileProps = {
  icon: IconName;
  title: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
  /** `stack`: icono arriba y texto centrado (rejilla de 3). `row`: icono a la izquierda (rejilla de 2 o lista). */
  layout?: 'stack' | 'row';
  className?: string;
};

/**
 * Tarjeta de elección única de los formularios de Emergencia (referencia: lienzo). La selección va en teal
 * con una marca de verificación, nunca solo por color.
 */
export function ChoiceTile({ icon, title, hint, selected, onPress, layout = 'row', className }: ChoiceTileProps) {
  const stack = layout === 'stack';
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={hint ? `${title}. ${hint}` : title}
      accessibilityState={{ selected, checked: selected }}
      onPress={onPress}
      className={cn(
        'rounded-2xl border-[2.5px] active:opacity-80',
        stack ? 'min-h-28 items-center justify-center gap-2 p-2' : 'min-h-20 flex-row items-center gap-3 p-3',
        selected ? 'border-primary bg-primary-fixed/40' : 'border-transparent bg-surface-container-lowest',
        className,
      )}>
      <View
        className={cn(
          'items-center justify-center rounded-full',
          stack ? 'h-12 w-12' : 'h-12 w-12',
          selected ? 'bg-primary' : 'bg-primary-fixed',
        )}>
        <Icon name={icon} size={26} color={selected ? 'onPrimary' : 'primary'} />
      </View>
      <View className={cn(!stack && 'flex-1')}>
        <Text variant="body-md-medium" className={cn(stack && 'text-center')}>
          {title}
        </Text>
        {hint ? (
          <Text variant="label-md" tone="muted" className={cn(stack && 'text-center')}>
            {hint}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <View className="absolute right-2 top-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Icon name="check" size={14} color="onPrimary" />
        </View>
      ) : null}
    </Pressable>
  );
}
