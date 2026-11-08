import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { formatRelativeTime } from '@/shared/format';
import { Button, Card, Icon, Screen, Text } from '@/shared/ui';

import { EmergencyNumbersCard } from './components/EmergencyNumbersCard';
import { IncidentStatusBadge, IncidentStatusTimeline } from './components/IncidentStatus';
import { reportIcon, reportTitle } from './components/ReportCard';
import { peopleSummary } from './people';
import { useEmergencyStore } from './store';
import { INCIDENT_STATUS_INFO } from './types';

/** Estado real de un reporte propio. En esta etapa siempre está guardado en el teléfono. */
export function ReportStatusScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const report = useEmergencyStore((s) => s.reports.find((r) => r.id === id));

  if (!report) {
    return (
      <Screen safeBottom>
        <Card>
          <Text variant="body-lg-bold">No encontramos este reporte</Text>
          <Text tone="muted">Puede que se haya borrado de este teléfono.</Text>
          <Button label="Volver al Centro de emergencias" onPress={() => router.replace('/emergencias')} />
        </Card>
      </Screen>
    );
  }

  const local = report.status === 'local' || report.status === 'pending';

  return (
    <Screen safeBottom noTopInset contentClassName="gap-4 px-5 pb-6 pt-2">
      <View className="items-center gap-2 pt-2">
        <View className={`h-24 w-24 items-center justify-center rounded-full ${local ? 'bg-warning-container' : 'bg-primary-fixed'}`}>
          <Icon name={local ? 'cellphone-check' : 'cloud-check-outline'} size={46} color={local ? 'warning' : 'primary'} />
        </View>
        <Text variant="headline-lg" className="text-center" accessibilityRole="header">
          {INCIDENT_STATUS_INFO[report.status].label}
        </Text>
        <Text tone="muted" className="text-center" accessibilityLiveRegion="polite">
          {INCIDENT_STATUS_INFO[report.status].description}
          {local ? ' Si hay riesgo para la vida, llama ahora a los servicios oficiales.' : ''}
        </Text>
      </View>

      <Card tone={report.immediateDanger ? 'error' : 'default'}>
        <View className="flex-row items-center gap-2">
          <Icon name={reportIcon(report)} size={26} color={report.immediateDanger ? 'error' : 'onSurface'} />
          <Text variant="headline-sm" className="flex-1">
            {reportTitle(report)}
          </Text>
        </View>
        <Text variant="label-md" tone="muted">
          Zona aproximada: {report.sectorName} · {formatRelativeTime(report.createdAt)}
        </Text>
        <IncidentStatusBadge status={report.status} />
        {peopleSummary(report) ? (
          <Text variant="body-md-medium" accessibilityLabel={`Personas: ${peopleSummary(report)}`}>
            {peopleSummary(report)}
          </Text>
        ) : null}
        {report.detail ? <Text>{report.detail}</Text> : null}
        {report.photoUri ? (
          <Image
            source={{ uri: report.photoUri }}
            style={{ width: '100%', height: 160, borderRadius: 12 }}
            contentFit="cover"
            accessibilityLabel="Foto adjunta al reporte"
          />
        ) : null}
      </Card>

      <Card>
        <Text variant="body-lg-bold">Seguimiento</Text>
        <IncidentStatusTimeline status={report.status} />
      </Card>

      <EmergencyNumbersCard />

      <View className="gap-1">
        <Button label="Ver mis reportes" size="lg" icon="clipboard-text-clock-outline" onPress={() => router.replace('/emergencias/mis-reportes')} />
        <Button label="Listo" variant="ghost" onPress={() => router.dismissTo('/emergencias')} />
      </View>
    </Screen>
  );
}
