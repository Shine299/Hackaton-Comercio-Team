import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { formatRelativeTime } from '@/shared/format';
import { Badge, Icon, Text } from '@/shared/ui';

import { useEmergencyStore } from '../store';
import { IncidentStatusBadge } from './IncidentStatus';
import { ReportCard } from './ReportCard';

/** Reportes y alertas guardados en este teléfono, cada uno con su estado real. */
export function MyReports({ filter = 'all' }: { filter?: 'all' | 'active' | 'resolved' }) {
  const router = useRouter();
  const allReports = useEmergencyStore((s) => s.reports);
  const allVulnerable = useEmergencyStore((s) => s.vulnerable);
  const keep = (status: string) => (filter === 'all' ? true : filter === 'resolved' ? status === 'resolved' : status !== 'resolved');
  const reports = allReports.filter((r) => keep(r.status));
  const vulnerable = allVulnerable.filter((v) => keep(v.status));

  return (
  <View className="gap-3">
    <Text variant="overline" tone="muted">
      Mis reportes en este teléfono
    </Text>
    {reports.length === 0 && vulnerable.length === 0 ? (
      <Text tone="muted">Aún no guardaste reportes. Lo que envíes aparecerá aquí con su estado real.</Text>
    ) : (
      reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onPress={() => router.push({ pathname: '/emergencias/estado/[id]', params: { id: report.id } })}
        />
      ))
    )}
    {vulnerable.map((alert) => (
      <Pressable
        key={alert.id}
        accessibilityRole="button"
        accessibilityLabel={`Alerta por un vecino, ${alert.sectorName}. Ver tablero`}
        onPress={() => router.push('/emergencias/tablero')}
        className="gap-2 rounded-2xl bg-surface-container-lowest p-4 shadow-sm elevation-xs active:opacity-80">
        <View className="flex-row items-center gap-2">
          <Icon name="account-heart-outline" size={22} color="error" />
          <Text variant="body-lg-bold" className="flex-1" numberOfLines={1}>
            Alerta por un vecino
          </Text>
        </View>
        <Text variant="label-md" tone="muted">
          Zona aproximada: {alert.sectorName} · {formatRelativeTime(alert.createdAt)}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <IncidentStatusBadge status={alert.status} />
          <Badge label="No validada" tone="warning" icon="shield-alert-outline" />
        </View>
      </Pressable>
    ))}
  </View>
  );
}
