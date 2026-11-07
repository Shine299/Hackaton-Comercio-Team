import { Pressable, View } from 'react-native';

import { cn, Icon, Text, type IconName } from '@/shared/ui';

type EmergencyActionTileProps = {
  icon: IconName;
  title: string;
  description: string;
  onPress: () => void;
  tone?: 'error' | 'primary' | 'secondary' | 'neutral';
};

const toneClass = {
  error: 'bg-error-container',
  primary: 'bg-primary-fixed',
  secondary: 'bg-secondary-fixed',
  neutral: 'bg-surface-container-lowest border-2 border-outline-variant',
} as const;

const iconTone = { error: 'error', primary: 'primary', secondary: 'secondary', neutral: 'onSurface' } as const;

/** Acceso grande del Centro de emergencias: icono + título + explicación corta. */
export function EmergencyActionTile({ icon, title, description, onPress, tone = 'neutral' }: EmergencyActionTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      className={cn('min-h-20 flex-row items-center gap-3 rounded-2xl p-4 active:opacity-80', toneClass[tone])}>
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/60">
        <Icon name={icon} size={26} color={iconTone[tone]} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="body-lg-bold">{title}</Text>
        <Text variant="label-md" tone="muted">
          {description}
        </Text>
      </View>
      <Icon name="chevron-right" size={22} color="onSurfaceVariant" />
    </Pressable>
  );
}
