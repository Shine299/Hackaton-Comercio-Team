import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { formatRelativeTime } from '@/shared/format';
import { DemoTag, Icon, Text, PressableScale } from '@/shared/ui';

import { useSectorPets } from './hooks';
import { lastSeen } from './sightings';
import { usePetsStore } from './store';

/** Acceso al perrito comunitario del sector (Inicio, Comunidad). */
export function PetTeaser() {
  const router = useRouter();
  const { pets } = useSectorPets();
  const sightings = usePetsStore((s) => s.sightings);
  const pet = pets[0];
  if (!pet) return null;
  const seen = lastSeen(pet, sightings);
  const when = formatRelativeTime(seen.at).toLowerCase();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${pet.name}, perrito comunitario. Visto ${when}, ${seen.zone}.${pet.isDemo ? ' Dato de demostración.' : ''} Ver perfil`}
      onPress={() => router.push({ pathname: '/perrito/[slug]', params: { slug: pet.slug } })}
      className="flex-row items-center gap-3.5 rounded-3xl bg-surface-container-lowest p-3.5 shadow-sm elevation-xs">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-warning-container">
        <Icon name="paw" size={30} color="warning" />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="body-lg-bold">{pet.name} · perrito del barrio</Text>
        <Text variant="label-md" tone="muted" numberOfLines={1}>
          Visto {when} · {seen.zone}
        </Text>
        {pet.isDemo ? <DemoTag /> : null}
      </View>
      <Icon name="chevron-right" size={24} color="onSurfaceVariant" />
    </PressableScale>
  );
}
