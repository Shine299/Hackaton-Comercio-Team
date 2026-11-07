import { View, type ViewProps } from 'react-native';

import { cn } from './cn';

type CardTone = 'default' | 'low' | 'error' | 'warning';

const toneClass: Record<CardTone, string> = {
  default: 'bg-surface-container-lowest',
  low: 'bg-surface-container',
  error: 'bg-error-container',
  warning: 'bg-warning-container',
};

export type CardProps = ViewProps & {
  tone?: CardTone;
  className?: string;
};

/** Contenedor de superficie. La urgencia nunca se comunica solo por color: añade texto/icono. */
export function Card({ tone = 'default', className, ...rest }: CardProps) {
  return (
    <View
      className={cn('gap-3 rounded-3xl p-4 shadow-sm elevation-xs', toneClass[tone], className)}
      {...rest}
    />
  );
}
