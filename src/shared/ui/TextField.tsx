import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { cn } from './cn';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { colors, MAX_FONT_SCALE } from './theme';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'className'> & {
  /** Etiqueta visible. Se usa también como `accessibilityLabel`. */
  label: string;
  /** Oculta la etiqueta visualmente (por ejemplo en barras de búsqueda) pero la conserva para lectores. */
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  leadingIcon?: IconName;
  /** Si hay texto, muestra un botón para borrarlo. */
  onClear?: () => void;
};

/**
 * Campo de texto accesible: etiqueta, ayuda y error explicado (con instrucciones para corregirlo).
 * Texto de 16 sp mínimo y alto táctil de 48 dp.
 */
export function TextField({
  label,
  hideLabel = false,
  hint,
  error,
  leadingIcon,
  onClear,
  value,
  ...inputProps
}: TextFieldProps) {
  const hasValue = typeof value === 'string' && value.length > 0;
  const multiline = Boolean(inputProps.multiline);

  return (
    <View className="gap-1.5">
      {!hideLabel ? (
        <Text variant="label-md" tone="muted">
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'flex-row gap-2 rounded-xl border-2 bg-surface-container-lowest px-3',
          multiline ? 'min-h-24 items-start py-2' : 'min-h-12 items-center',
          error ? 'border-error' : 'border-outline-variant',
        )}>
        {leadingIcon ? <Icon name={leadingIcon} size={20} color="onSurfaceVariant" /> : null}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={hint}
          placeholderTextColor={colors.outline}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          value={value}
          textAlignVertical={multiline ? 'top' : 'center'}
          className={cn('flex-1 font-inter text-body-lg text-on-surface', multiline ? 'min-h-20' : 'min-h-11')}
          {...inputProps}
        />
        {onClear && hasValue ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Borrar texto"
            onPress={onClear}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full active:bg-surface-container">
            <Icon name="close" size={20} color="onSurfaceVariant" />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View className="flex-row items-start gap-1.5" accessibilityLiveRegion="polite">
          <Icon name="alert-circle-outline" size={16} color="error" />
          <Text variant="label-md" tone="error" className="flex-1">
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text variant="label-md" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
