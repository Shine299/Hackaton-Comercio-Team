import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { SYNC_STATUSES } from '@/shared/sync/status';
import {
  Badge,
  Button,
  Card,
  Chip,
  DemoTag,
  Screen,
  SegmentedControl,
  SyncStatusBadge,
  Text,
  TextField,
} from '@/shared/ui';

/** Galería interna para revisar el sistema de diseño (no forma parte del flujo de usuario). */
export function DesignGalleryScreen() {
  const router = useRouter();

  return (
    <Screen
      safeBottom
      footer={<Button label="Volver" variant="tonal" icon="arrow-left" onPress={() => router.back()} />}>
      <Text variant="display">Sistema de diseño</Text>

      <Card>
        <Text variant="overline" tone="muted">
          Tipografía
        </Text>
        <Text variant="headline-lg">Headline lg</Text>
        <Text variant="headline-md">Headline md</Text>
        <Text variant="headline-sm">Headline sm</Text>
        <Text variant="body-lg">Body lg: lenguaje cotidiano y frases breves.</Text>
        <Text variant="body-md">Body md: descripción secundaria.</Text>
        <Text variant="label-md" tone="muted">
          Label md
        </Text>
      </Card>

      <Card>
        <Text variant="overline" tone="muted">
          Botones
        </Text>
        <Button label="Primario" icon="check" />
        <Button label="Secundario" variant="secondary" icon="handshake-outline" />
        <Button label="Tonal" variant="tonal" />
        <Button label="Contorno" variant="outline" />
        <Button label="Peligro / SOS" variant="danger" icon="alarm-light-outline" />
        <Button label="Deshabilitado" disabled />
        <Button label="Cargando" loading />
      </Card>

      <Card>
        <Text variant="overline" tone="muted">
          Estados de sincronización
        </Text>
        <View className="gap-2">
          {SYNC_STATUSES.map((status) => (
            <SyncStatusBadge key={status} status={status} />
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="overline" tone="muted">
          Formularios y filtros
        </Text>
        <TextField
          label="Campo de ejemplo"
          hint="Ayuda breve debajo del campo"
          placeholder="Escribe aquí…"
          leadingIcon="magnify"
        />
        <TextField label="Campo con error" error="Escribe al menos 3 letras para buscar." value="ab" />
        <View className="flex-row flex-wrap gap-2">
          <Chip label="Seleccionado" selected />
          <Chip label="Sin seleccionar" icon="tag-outline" />
        </View>
        <SegmentedControl
          accessibilityLabel="Ejemplo de vista"
          value="list"
          onChange={() => {}}
          options={[
            { value: 'list', label: 'Lista', icon: 'format-list-bulleted' },
            { value: 'map', label: 'Mapa', icon: 'map-outline' },
          ]}
        />
      </Card>

      <Card>
        <Text variant="overline" tone="muted">
          Etiquetas
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge label="Ofrece gratis" tone="primary" icon="gift-outline" />
          <Badge label="Solicitud" tone="secondary" />
          <Badge label="Vecino verificado" tone="success" icon="check-decagram-outline" />
          <Badge label="Urgente" tone="error" icon="alert-outline" />
          <DemoTag />
        </View>
      </Card>
    </Screen>
  );
}
