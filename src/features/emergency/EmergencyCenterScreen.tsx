import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Card, Icon, Screen, Text } from '@/shared/ui';

import { EmergencyActionTile } from './components/EmergencyActionTile';
import { EmergencyNumbersCard } from './components/EmergencyNumbersCard';
import { MyReports } from './components/MyReports';
import { useEmergencyStore } from './store';

export function EmergencyCenterScreen() {
  const router = useRouter();
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

      <MyReports />
    </Screen>
  );
}
