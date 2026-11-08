import { Pressable, View } from 'react-native';

import { formatRelativeTime } from '@/shared/format';
import { Badge, Icon, Text } from '@/shared/ui';

import { peopleSummary } from '../people';
import { getHelpType, getIncidentCategory, type EmergencyReport } from '../types';

import { IncidentStatusBadge } from './IncidentStatus';

export function reportTitle(report: EmergencyReport): string {
  if (report.kind === 'incident') return getIncidentCategory(report.category).label;
  if (report.immediateDanger) return 'Peligro inmediato';
  return `Necesito ayuda: ${getHelpType(report.category).label.toLowerCase()}`;
}

export function reportIcon(report: EmergencyReport) {
  if (report.kind === 'incident') return getIncidentCategory(report.category).icon;
  return report.immediateDanger ? 'alarm-light-outline' : getHelpType(report.category).icon;
}

/** Resumen de un reporte propio, con su estado real (en esta etapa, siempre en el teléfono). */
export function ReportCard({ report, onPress }: { report: EmergencyReport; onPress: () => void }) {
  const title = reportTitle(report);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${report.sectorName}. Ver estado`}
      onPress={onPress}
      className="gap-2 rounded-2xl bg-surface-container-lowest p-4 shadow-sm elevation-xs active:opacity-80">
      <View className="flex-row items-center gap-2">
        <Icon name={reportIcon(report)} size={22} color={report.immediateDanger ? 'error' : 'onSurface'} />
        <Text variant="body-lg-bold" className="flex-1" numberOfLines={1}>
          {title}
        </Text>
        <Icon name="chevron-right" size={20} color="onSurfaceVariant" />
      </View>
      <Text variant="label-md" tone="muted">
        Zona aproximada: {report.sectorName} · {formatRelativeTime(report.createdAt)}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        <IncidentStatusBadge status={report.status} />
        {peopleSummary(report) ? <Badge label={peopleSummary(report) as string} icon={report.peopleAtRisk === 'yes' ? 'alert-octagon-outline' : 'account-multiple-outline'} tone={report.peopleAtRisk === 'yes' ? 'warning' : 'neutral'} /> : null}
        {report.kind === 'incident' ? <Badge label="Incidente" icon="alert-outline" /> : null}
      </View>
    </Pressable>
  );
}
