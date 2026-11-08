import { Pressable, View } from 'react-native';

import { useViewModeStore, type ViewMode } from '@/shared/nav/viewModeStore';

import { cn } from './cn';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

const OPTIONS: { id: ViewMode; title: string; hint: string; icon: IconName }[] = [
  { id: 'standard', title: 'Estándar', hint: 'Como la ves ahora.', icon: 'cellphone' },
  { id: 'easy', title: 'Fácil', hint: 'Letra grande, botones enormes y una sola columna.', icon: 'eye-plus-outline' },
];

/**
 * «Elige cómo ver la app». El cambio se aplica al instante en toda la app, así que quien elige ve el resultado
 * de inmediato (en el tutorial y en Ajustes del perfil). Se puede cambiar cuando quiera.
 */
export function ViewModePicker() {
  const mode = useViewModeStore((s) => s.mode);
  const setMode = useViewModeStore((s) => s.setMode);

  return (
    <View className="gap-3" accessibilityRole="radiogroup" accessibilityLabel="Cómo ver la app">
      {OPTIONS.map((option) => {
        const selected = mode === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityLabel={`${option.title}. ${option.hint}`}
            accessibilityState={{ selected, checked: selected }}
            onPress={() => setMode(option.id)}
            className={cn(
              'min-h-20 flex-row items-center gap-3 rounded-2xl border-[2.5px] p-3 active:opacity-80',
              selected ? 'border-primary bg-primary-fixed/40' : 'border-transparent bg-surface-container-lowest',
            )}>
            <View className={cn('h-12 w-12 items-center justify-center rounded-full', selected ? 'bg-primary' : 'bg-primary-fixed')}>
              <Icon name={option.icon} size={26} color={selected ? 'onPrimary' : 'primary'} />
            </View>
            <View className="min-w-0 flex-1">
              <Text variant="body-lg-bold">{option.title}</Text>
              <Text variant="label-md" tone="muted">
                {option.hint}
              </Text>
            </View>
            {selected ? <Icon name="check-circle" size={26} color="primary" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
