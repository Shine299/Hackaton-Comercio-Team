import { Linking, Pressable, View } from 'react-native';

import { Button, Card, Icon, Text } from '@/shared/ui';

import { SECTORS } from '../data';
import { useSectorStore } from '../store';
import { useDetectSector, type DetectState } from '../useDetectSector';

function DetectMessage({ state }: { state: DetectState }) {
  if (state.phase !== 'done') return null;
  const { result } = state;

  switch (result.status) {
    case 'ok':
      return (
        <Card tone="low" accessibilityLiveRegion="polite">
          <View className="flex-row items-center gap-2">
            <Icon name="check-circle-outline" size={22} color="success" />
            <Text variant="body-lg-bold">Sector detectado: {result.sector.name}</Text>
          </View>
          <Text tone="muted">Puedes cambiarlo cuando quieras.</Text>
        </Card>
      );
    case 'denied':
      return (
        <Card tone="warning" accessibilityLiveRegion="polite">
          <Text variant="body-lg-bold">No usamos tu ubicación</Text>
          <Text>No pasa nada: elige tu sector en la lista y la app funciona igual.</Text>
          {!result.canAskAgain ? (
            <Button
              label="Abrir ajustes del teléfono"
              variant="outline"
              icon="cog-outline"
              onPress={() => Linking.openSettings()}
            />
          ) : null}
        </Card>
      );
    case 'outside':
      return (
        <Card tone="warning" accessibilityLiveRegion="polite">
          <Text variant="body-lg-bold">Estás fuera de los sectores disponibles</Text>
          <Text>
            El más cercano es {result.nearest.name} (a unos {Math.round(result.distanceKm)} km).
            Elígelo o escoge otro en la lista.
          </Text>
        </Card>
      );
    case 'unavailable':
      return (
        <Card tone="warning" accessibilityLiveRegion="polite">
          <Text variant="body-lg-bold">No pudimos obtener tu ubicación</Text>
          <Text>Quizá el GPS está apagado. Elige tu sector en la lista para continuar.</Text>
        </Card>
      );
  }
}

/**
 * Selector de sector: sugerencia por GPS (opcional) + lista manual siempre disponible.
 * El GPS nunca bloquea el uso de la app.
 */
export function SectorPicker() {
  const sector = useSectorStore((s) => s.sector);
  const sectorConfirmed = useSectorStore((s) => s.sectorConfirmed);
  const setSector = useSectorStore((s) => s.setSector);
  const { state, detect } = useDetectSector();

  return (
    <View className="gap-4">
      <Button
        label="Usar mi ubicación"
        icon="crosshairs-gps"
        variant="tonal"
        loading={state.phase === 'loading'}
        onPress={detect}
        accessibilityHint="Sugiere tu sector con el GPS. No guardamos tu ubicación exacta."
      />

      <DetectMessage state={state} />

      <View className="gap-2">
        <Text variant="label-md" tone="muted">
          O elige tu sector
        </Text>
        <Card className="gap-1 p-2">
          {SECTORS.map((item) => {
            const selected = sectorConfirmed && item.id === sector.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="radio"
                accessibilityLabel={`${item.name}, ${item.city}`}
                accessibilityState={{ selected }}
                onPress={() => setSector(item)}
                className="min-h-14 flex-row items-center justify-between rounded-xl px-3 active:bg-surface-container-low">
                <View>
                  <Text variant="body-lg-bold">{item.name}</Text>
                  <Text variant="label-md" tone="muted">
                    {item.city}
                  </Text>
                </View>
                <Icon
                  name={selected ? 'radiobox-marked' : 'radiobox-blank'}
                  size={26}
                  color={selected ? 'primary' : 'outline'}
                />
              </Pressable>
            );
          })}
        </Card>
      </View>
    </View>
  );
}
