import * as Crypto from 'expo-crypto';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { FundCard, useSectorFunds } from '@/features/funds';
import { formatRelativeTime } from '@/shared/format';
import { Badge, BottomSheet, Button, Card, Chip, DemoTag, Icon, type IconName, ListenButton, Screen, ScreenHeader, Text } from '@/shared/ui';

import { usePet } from './hooks';
import { lastSeen } from './sightings';
import { usePetsStore } from './store';
import type { PetSighting } from './types';

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed">
        <Icon name={icon} size={22} color="primary" />
      </View>
      <View className="flex-1">
        <Text variant="label-md" tone="muted">
          {label}
        </Text>
        <Text variant="body-md-medium">{value}</Text>
      </View>
    </View>
  );
}

/**
 * Perfil del perrito comunitario (también se abre con el QR del collar: yunta://perrito/<slug>).
 * «Lo vi» y «Necesita ayuda» guardan solo una zona aproximada.
 */
export function PetScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { pet } = usePet(String(slug ?? ''));
  const sightings = usePetsStore((s) => s.sightings);
  const addSighting = usePetsStore((s) => s.add);
  const { data: fundsData } = useSectorFunds();
  const [sheet, setSheet] = useState<PetSighting['kind'] | null>(null);

  if (!pet) {
    return (
      <Screen header={<ScreenHeader title="Perrito comunitario" />} safeBottom>
        <Card>
          <Text variant="headline-sm">No encontramos a este perrito</Text>
          <Text tone="muted">Puede que el QR sea de otro sector. Revisa el sector elegido en la cabecera.</Text>
        </Card>
      </Screen>
    );
  }

  const seen = lastSeen(pet, sightings);
  const fund = fundsData?.funds.find((f) => f.id === pet.fundId);
  const zones = [pet.homeZone, 'Cuadra 3', 'Cuadra 4', 'Cuadra 5', 'Cerca del mercado'];
  const helpNotes = sightings.filter((s) => s.petId === pet.id && s.kind === 'needs-help');

  const save = (zone: string) => {
    if (!sheet) return;
    addSighting({ id: Crypto.randomUUID(), petId: pet.id, zone, kind: sheet });
    setSheet(null);
    if (sheet === 'needs-help') router.navigate('/publicar');
  };

  return (
    <Screen
      header={<ScreenHeader title="Perrito comunitario" />}
      safeBottom
      footer={
        <View className="flex-row gap-2">
          <Button label="Lo vi" variant="outline" icon="eye-outline" fullWidth={false} className="flex-1" onPress={() => setSheet('seen')} />
          <Button label="Necesita ayuda" variant="secondary" icon="medical-bag" fullWidth={false} className="flex-[1.3]" onPress={() => setSheet('needs-help')} />
        </View>
      }>
      <LinearGradient colors={['#ffe7bf', '#ffd08a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 150, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="paw" size={88} color="warning" />
      </LinearGradient>

      <View className="gap-1.5">
        <View className="flex-row flex-wrap gap-2">
          <Badge label="Perrito comunitario" tone="primary" icon="paw" />
          {pet.isDemo ? <DemoTag /> : null}
        </View>
        <Text variant="headline-lg">{pet.name}</Text>
        <Text tone="muted">{pet.description}</Text>
        <ListenButton text={`${pet.name}. ${pet.description} Visto ${formatRelativeTime(seen.at).toLowerCase()}, ${seen.zone}.`} />
      </View>

      <Card className="flex-row items-center gap-3">
        <Icon name="eye-check-outline" size={24} color="success" />
        <View className="flex-1">
          <Text variant="body-lg-bold">
            Visto {formatRelativeTime(seen.at).toLowerCase()} · {seen.zone}
          </Text>
          {seen.mine ? (
            <Text variant="label-md" tone="warning">
              Lo marcaste tú · guardado en tu teléfono
            </Text>
          ) : null}
        </View>
      </Card>

      <View className="gap-3">
        <InfoRow icon="map-marker-radius-outline" label="Zona donde vive (aproximada)" value={pet.homeZone} />
        <InfoRow icon="needle" label="Salud" value={pet.health} />
        <InfoRow icon="qrcode" label="En su collar" value="Un QR que abre este perfil" />
      </View>

      {helpNotes.length > 0 ? (
        <Card tone="warning" className="flex-row items-center gap-3">
          <Icon name="medical-bag" size={22} color="warning" />
          <Text variant="body-md-medium" className="flex-1">
            Avisaste que necesita ayuda ({helpNotes[0].zone}) · guardado en tu teléfono
          </Text>
        </Card>
      ) : null}

      {fund ? (
        <View className="gap-2">
          <Text variant="headline-sm">Su fondo</Text>
          <FundCard fund={fund} now={fundsData?.fetchedAt ?? 0} />
        </View>
      ) : null}

      <BottomSheet visible={sheet !== null} onClose={() => setSheet(null)} title={sheet === 'needs-help' ? `¿Dónde está ${pet.name}?` : `¿Dónde viste a ${pet.name}?`}>
        <View className="gap-3">
          <Text tone="muted">Elige la zona aproximada. Nunca pedimos una dirección exacta.</Text>
          <View className="flex-row flex-wrap gap-2">
            {zones.map((z) => (
              <Chip key={z} label={z} icon="map-marker-outline" onPress={() => save(z)} />
            ))}
          </View>
          {sheet === 'needs-help' ? (
            <Text variant="label-md" tone="muted">
              Después podrás publicar un pedido de ayuda para que los vecinos se organicen.
            </Text>
          ) : null}
        </View>
      </BottomSheet>
    </Screen>
  );
}
