import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { formatRelativeTime } from '@/shared/format';
import { Badge, Card, Icon, Screen, Text } from '@/shared/ui';

import { EmergencyActionTile } from './components/EmergencyActionTile';
import { EmergencyNumbersCard } from './components/EmergencyNumbersCard';
import { IncidentStatusBadge } from './components/IncidentStatus';
import { ReportCard } from './components/ReportCard';
import { useEmergencyStore } from './store';

export function EmergencyCenterScreen() {
  const router = useRouter();
  const reports = useEmergencyStore((s) => s.reports);
  const vulnerable = useEmergencyStore((s) => s.vulnerable);
  const addHelp = useEmergencyStore((s) => s.addHelp);

  const sendImmediateDanger = () => {
    const report = addHelp({ type: 'other', immediateDanger: true });
    router.push({ pathname: '/emergencias/estado/[id]', params: { id: report.id } });
  };

  return (
    <Screen safeBottom>
      <Card tone="warning">
        <Text variant="body-lg-bold">Aviso importante</Text>
        <Text>
          Esta app coordina ayuda entre vecinos. No reemplaza a los servicios oficiales de emergencia
          ni garantiza que un reporte haya sido recibido.
        </Text>
      </Card>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Peligro inmediato. Guarda una alerta mínima en un toque y muestra los números de emergencia"
        onPress={sendImmediateDanger}
        className="min-h-24 flex-row items-center gap-4 rounded-2xl bg-error p-5 active:opacity-80">
        <Icon name="alarm-light-outline" size={36} color="onError" />
        <View className="flex-1">
          <Text variant="headline-md" tone="onError">
            Peligro inmediato
          </Text>
          <Text tone="onError">Un toque. Sin formulario.</Text>
        </View>
      </Pressable>

      <EmergencyNumbersCard />

      <View className="gap-3">
        <Text variant="overline" tone="muted">
          ¿Qué necesitas hacer?
        </Text>
        <EmergencyActionTile
          tone="error"
          icon="hand-back-left-outline"
          title="Necesito ayuda"
          description="Tipo de ayuda y zona aproximada. Lo demás es opcional."
          onPress={() => router.push('/emergencias/necesito-ayuda')}
        />
        <EmergencyActionTile
          tone="secondary"
          icon="alert-octagon-outline"
          title="Reportar incidente"
          description="Incendio, inundación, derrumbe, riesgo eléctrico o vía bloqueada."
          onPress={() => router.push('/emergencias/reportar')}
        />
        <EmergencyActionTile
          tone="secondary"
          icon="account-heart-outline"
          title="Ayudar a un vecino vulnerable"
          description="Reporta por otra persona en 3 pasos, sin nombre ni diagnóstico."
          onPress={() => router.push('/emergencias/vecino-vulnerable')}
        />
        <EmergencyActionTile
          tone="primary"
          icon="hand-heart-outline"
          title="Ofrecer ayuda"
          description="Agua, alimentos, transporte, herramientas o tu tiempo."
          onPress={() => router.push('/emergencias/ofrecer')}
        />
        <EmergencyActionTile
          icon="package-variant"
          title="Necesidades y recursos"
          description="Qué falta y qué hay disponible en tu sector."
          onPress={() => router.push('/emergencias/recursos')}
        />
        <EmergencyActionTile
          icon="view-dashboard-outline"
          title="Tablero del sector"
          description="Incidentes, necesidades y recursos, con motivo y estado."
          onPress={() => router.push('/emergencias/tablero')}
        />
        <EmergencyActionTile
          icon="map-outline"
          title="Mapa comunitario"
          description="Incidentes, necesidades, recursos y lugares en el mapa de tu sector."
          onPress={() => router.push('/mapa')}
        />
      </View>

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
    </Screen>
  );
}
