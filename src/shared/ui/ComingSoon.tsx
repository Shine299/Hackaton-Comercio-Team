import { View } from 'react-native';

import { Badge } from './Badge';
import { Card } from './Card';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type ComingSoonProps = {
  icon: IconName;
  title: string;
  description: string;
  stage: string;
};

/** Marcador explícito de pantalla aún no implementada (no simula funcionalidad). */
export function ComingSoon({ icon, title, description, stage }: ComingSoonProps) {
  return (
    <Card className="items-center gap-3 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-surface-container">
        <Icon name={icon} size={30} color="primary" />
      </View>
      <Text variant="headline-md" className="text-center">
        {title}
      </Text>
      <Text tone="muted" className="text-center">
        {description}
      </Text>
      <Badge label={`En construcción · ${stage}`} tone="warning" icon="hammer-wrench" />
    </Card>
  );
}
