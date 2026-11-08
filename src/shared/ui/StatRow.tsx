import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type Stat = {
  icon: IconName;
  value: number | string;
  label: string;
  gradient: readonly [string, string];
};

/** Fila de cifras grandes y de colores: lo importante de la sección sin leer un párrafo. */
export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <View className="flex-row gap-2.5" accessibilityRole="summary">
      {stats.map((stat) => (
        <View
          key={stat.label}
          accessible
          accessibilityLabel={`${stat.value} ${stat.label}`}
          className="flex-1 overflow-hidden rounded-2xl shadow-sm elevation-xs">
          <LinearGradient
            colors={stat.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 12, gap: 2, minHeight: 84, justifyContent: 'space-between' }}>
            <View className="flex-row items-center justify-between">
              <Text variant="headline-lg" tone="onPrimary">
                {stat.value}
              </Text>
              <Icon name={stat.icon} size={22} color="onPrimary" />
            </View>
            <Text variant="label-md" tone="onPrimary" numberOfLines={2} className="opacity-95">
              {stat.label}
            </Text>
          </LinearGradient>
        </View>
      ))}
    </View>
  );
}
