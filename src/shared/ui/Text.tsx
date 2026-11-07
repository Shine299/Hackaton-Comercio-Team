import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from './cn';
import { MAX_FONT_SCALE } from './theme';

export type TextVariant =
  | 'display'
  | 'headline-lg'
  | 'headline-md'
  | 'headline-sm'
  | 'body-lg'
  | 'body-lg-bold'
  | 'body-md'
  | 'body-md-medium'
  | 'label-md'
  | 'label-sm'
  | 'overline';

export type TextTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'success'
  | 'warning'
  | 'onPrimary'
  | 'onError'
  | 'onSecondary';

const variantClass: Record<TextVariant, string> = {
  display: 'font-inter-bold text-display',
  'headline-lg': 'font-inter-bold text-headline-lg',
  'headline-md': 'font-inter-semibold text-headline-md',
  'headline-sm': 'font-inter-semibold text-headline-sm',
  'body-lg': 'font-inter text-body-lg',
  'body-lg-bold': 'font-inter-semibold text-body-lg',
  'body-md': 'font-inter text-body-md',
  'body-md-medium': 'font-inter-medium text-body-md',
  'label-md': 'font-inter-semibold text-label-md',
  'label-sm': 'font-inter-semibold text-label-sm',
  overline: 'font-inter-bold text-label-sm uppercase tracking-wider',
};

const toneClass: Record<TextTone, string> = {
  default: 'text-on-surface',
  muted: 'text-on-surface-variant',
  primary: 'text-primary',
  secondary: 'text-secondary',
  error: 'text-error',
  success: 'text-success',
  warning: 'text-warning',
  onPrimary: 'text-on-primary',
  onError: 'text-on-error',
  onSecondary: 'text-on-secondary',
};

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
};

/**
 * Texto base de la app. Respeta el tamaño de fuente del sistema
 * (con un techo de `MAX_FONT_SCALE`) y usa Inter por peso.
 */
export function Text({
  variant = 'body-md',
  tone = 'default',
  className,
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  ...rest
}: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={cn(variantClass[variant], toneClass[tone], className)}
      {...rest}
    />
  );
}
