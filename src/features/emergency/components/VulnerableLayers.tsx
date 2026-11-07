import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Badge, Icon, Text, type IconName } from '@/shared/ui';

import { getReportBasis, getVulnerableNeed, type ReportBasis, type VulnerableNeed } from '../types';

type VulnerableLayersProps = {
  need: VulnerableNeed;
  basis: ReportBasis;
  /** `true` solo si una persona autorizada validó la emergencia. Hoy nunca ocurre. */
  validated?: boolean;
};

function Layer({ icon, title, value, badge }: { icon: IconName; title: string; value: string; badge: ReactNode }) {
  return (
    <View className="gap-1 rounded-xl bg-surface-container-low p-3">
      <View className="flex-row items-center gap-2">
        <Icon name={icon} size={18} color="primary" />
        <Text variant="overline" tone="muted">
          {title}
        </Text>
      </View>
      <Text variant="body-md-medium">{value}</Text>
      {badge}
    </View>
  );
}

/**
 * Separa tres cosas que no deben confundirse (docs 03 §6):
 * condición de vulnerabilidad reportada, necesidad comunicada y emergencia validada.
 */
export function VulnerableLayers({ need, basis, validated = false }: VulnerableLayersProps) {
  const confirmedByPerson = basis === 'present' || basis === 'authorized';
  return (
    <View className="gap-2">
      <Layer
        icon="account-alert-outline"
        title="1 · Condición de vulnerabilidad"
        value="Reportada por un tercero"
        badge={
          <Badge
            label={confirmedByPerson ? 'Con conocimiento de la persona' : 'Sin confirmar por la persona'}
            tone={confirmedByPerson ? 'primary' : 'warning'}
            icon={confirmedByPerson ? 'check' : 'help-circle-outline'}
          />
        }
      />
      <Layer
        icon={getVulnerableNeed(need).icon}
        title="2 · Necesidad comunicada"
        value={getVulnerableNeed(need).label}
        badge={<Badge label={getReportBasis(basis).label} tone="neutral" icon={getReportBasis(basis).icon} />}
      />
      <Layer
        icon="shield-check-outline"
        title="3 · Emergencia validada"
        value={validated ? 'Validada por una persona autorizada' : 'Aún no validada'}
        badge={
          <Badge
            label={validated ? 'Validada' : 'Sin revisión humana'}
            tone={validated ? 'success' : 'warning'}
            icon={validated ? 'check-decagram-outline' : 'clock-outline'}
          />
        }
      />
    </View>
  );
}
