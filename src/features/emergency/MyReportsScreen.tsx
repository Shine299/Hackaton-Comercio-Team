import { useState } from 'react';

import { Screen, SegmentedControl, Text } from '@/shared/ui';

import { MyReports } from './components/MyReports';
import { useEmergencyStore } from './store';

/** «Mis reportes»: todo lo que enviaste desde este teléfono y cómo va cada cosa, en Activas y Resueltas. */
export function MyReportsScreen() {
  const [tab, setTab] = useState<'active' | 'resolved'>('active');
  const activeCount = useEmergencyStore(
    (s) => s.reports.filter((r) => r.status !== 'resolved').length + s.vulnerable.filter((v) => v.status !== 'resolved').length,
  );

  return (
    <Screen noTopInset contentClassName="gap-4 px-5 pb-6 pt-2">
      <Text variant="headline-lg" accessibilityRole="header">
        Mis reportes y solicitudes
      </Text>
      <SegmentedControl
        accessibilityLabel="Filtrar por estado"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'active', label: `Activas (${activeCount})` },
          { value: 'resolved', label: 'Resueltas' },
        ]}
      />
      <MyReports filter={tab} />
    </Screen>
  );
}
