import { View } from 'react-native';

import { cn } from './cn';
import { Icon, type IconName } from './Icon';
import { Text, type TextTone } from './Text';
import type { ColorToken } from './theme';

export type BadgeTone = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

const config: Record<BadgeTone, { container: string; text: TextTone; icon: ColorToken }> = {
  neutral: { container: 'bg-surface-container', text: 'muted', icon: 'onSurfaceVariant' },
  primary: { container: 'bg-primary-fixed', text: 'primary', icon: 'primary' },
  secondary: { container: 'bg-secondary-fixed', text: 'secondary', icon: 'secondary' },
  success: { container: 'bg-success-container', text: 'success', icon: 'success' },
  warning: { container: 'bg-warning-container', text: 'warning', icon: 'warning' },
  error: { container: 'bg-error-container', text: 'error', icon: 'error' },
};

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  className?: string;
};

/** Etiqueta de estado. Siempre con texto; el icono es opcional y refuerza el significado. */
export function Badge({ label, tone = 'neutral', icon, className }: BadgeProps) {
  const c = config[tone];
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full px-2.5 py-1',
        c.container,
        className,
      )}>
      {icon ? <Icon name={icon} size={14} color={c.icon} /> : null}
      <Text variant="label-sm" tone={c.text}>
        {label}
      </Text>
    </View>
  );
}
