import { Screen, Text } from '@/shared/ui';

import { MyReports } from './components/MyReports';

/** «Mis reportes»: todo lo que enviaste desde este teléfono y cómo va cada cosa. */
export function MyReportsScreen() {
  return (
    <Screen>
      <Text variant="headline-md" accessibilityRole="header">
        Mis reportes
      </Text>
      <MyReports />
    </Screen>
  );
}
