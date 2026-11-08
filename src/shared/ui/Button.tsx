import { ActivityIndicator, View, type PressableProps } from 'react-native';

import { PressableScale } from './PressableScale';

import { useEasyMode } from '@/shared/nav/viewModeStore';

import { cn } from './cn';
import { Icon, type IconName } from './Icon';
import { Text, type TextTone } from './Text';
import { colors, type ColorToken } from './theme';

export type ButtonVariant = 'primary' | 'secondary' | 'tonal' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'md' | 'lg';

const containerClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tonal: 'bg-surface-container',
  danger: 'bg-error',
  outline: 'bg-transparent border-2 border-outline-variant',
  ghost: 'bg-transparent',
};

const toneFor: Record<ButtonVariant, TextTone> = {
  primary: 'onPrimary',
  secondary: 'onSecondary',
  tonal: 'default',
  danger: 'onError',
  outline: 'primary',
  ghost: 'primary',
};

const iconColorFor: Record<ButtonVariant, ColorToken> = {
  primary: 'onPrimary',
  secondary: 'onSecondary',
  tonal: 'onSurface',
  danger: 'onError',
  outline: 'primary',
  ghost: 'primary',
};

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
};

/**
 * Botón accesible: alto mínimo 48 dp, rol y estado para lectores de pantalla,
 * icono siempre acompañado de texto.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = true,
  disabled,
  className,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const easy = useEasyMode();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-2xl px-4',
        easy ? 'min-h-16' : size === 'lg' ? 'min-h-14' : 'min-h-12',
        fullWidth ? 'self-stretch' : 'self-start',
        containerClass[variant],
        isDisabled && 'opacity-50',
        className,
      )}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={colors[iconColorFor[variant]]} />
      ) : icon ? (
        <View>
          <Icon name={icon} size={size === 'lg' ? 24 : 20} color={iconColorFor[variant]} />
        </View>
      ) : null}
      <Text variant={size === 'lg' ? 'body-lg-bold' : 'body-md-medium'} tone={toneFor[variant]}>
        {label}
      </Text>
    </PressableScale>
  );
}
