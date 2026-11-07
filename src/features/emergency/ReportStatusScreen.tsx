import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { formatRelativeTime } from '@/shared/format';
import { Button, Card, Icon, Screen, Text } from '@/shared/ui';

import { EmergencyNumbersCard } from './components/EmergencyNumbersCard';
import { IncidentStatusBadge, IncidentStatusTimeline } from './components/IncidentStatus';
import { reportIcon, reportTitle } from './components/ReportCard';
import { useEmergencyStore } from './store';

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
    <Screen safeBottom>
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

      {local ? (
        <Card tone="warning" accessibilityLiveRegion="polite">
          <Text variant="body-lg-bold">Está guardado en tu teléfono</Text>
          <Text>
            Aún no se envió a nadie y nadie lo ha recibido. Si hay riesgo para la vida, llama ahora a
            los servicios oficiales.
          </Text>
        </Card>
      ) : null}

      <EmergencyNumbersCard />

      <Card>
        <Text variant="body-lg-bold">Seguimiento</Text>
        <IncidentStatusTimeline status={report.status} />
      </Card>

      <Button label="Volver al Centro de emergencias" variant="outline" onPress={() => router.dismissTo('/emergencias')} />
    </Screen>
  );
}
