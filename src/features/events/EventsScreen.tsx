import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { SectionHeader } from '@/features/shell';
import { Button, Card, GRADIENTS, Icon, Screen, SectionHero, Text } from '@/shared/ui';

import { EventCard } from './EventCard';
import { groupEventsByWhen } from './logic';
import { useSectorEvents } from './sectorEvents';
import type { SectorEvent } from './types';

function Group({ title, events, now }: { title: string; events: SectorEvent[]; now: number }) {
  const router = useRouter();
  if (events.length === 0) return null;
  return (
    <View className="gap-3">
      <Text variant="headline-sm" accessibilityRole="header">
        {title}
      </Text>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          now={now}
          compact
          onPress={() => router.push({ pathname: '/evento/[id]', params: { id: event.id } })}
        />
      ))}
    </View>
  );
}

/**
 * Pestaña Eventos (SPEC-046): lo que organizan los vecinos y las instituciones del barrio, por fecha. Cualquier
 * vecino con cuenta puede crear uno; los demás marcan «Voy». Nadie ve quién va: solo cuántos.
 */
export function EventsScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading } = useSectorEvents(sector.id, sector.name);
  const now = data?.fetchedAt ?? 0;
  const groups = useMemo(() => groupEventsByWhen(data?.events ?? [], now), [data?.events, now]);
  const empty = groups.today.length + groups.week.length + groups.later.length === 0;

  return (
    <Screen contentClassName="gap-4 px-5 pb-6 pt-4">
      <SectionHeader title="Comunidad" />

      <SectionHero
        gradient={GRADIENTS.recomendado}
        title="Lo que se viene en tu barrio"
        description={`Charlas, ferias y reuniones cerca de ${sector.name}.`}
        steps={[
          { icon: 'calendar-search', label: 'Mira' },
          { icon: 'check-circle-outline', label: 'Marca «Voy»' },
          { icon: 'calendar-plus', label: 'Organiza' },
        ]}
      />

      <Button label="Crear evento" icon="calendar-plus" onPress={() => router.push('/eventos/crear')} />

      {isLoading ? (
        <View className="items-center py-6" accessibilityLabel="Cargando eventos">
          <ActivityIndicator />
        </View>
      ) : empty ? (
        <Card className="items-center gap-2 py-8">
          <Icon name="calendar-blank-outline" size={34} color="primary" />
          <Text variant="headline-sm" className="text-center">
            Aún no hay eventos próximos
          </Text>
          <Text tone="muted" className="text-center">
            Organiza el primero: una charla, una feria o un lonche con tus vecinos.
          </Text>
        </Card>
      ) : (
        <>
          <Group title="Hoy" events={groups.today} now={now} />
          <Group title="Esta semana" events={groups.week} now={now} />
          <Group title="Más adelante" events={groups.later} now={now} />
        </>
      )}

      <View className="flex-row items-start gap-2 px-1">
        <Icon name="shield-lock-outline" size={18} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          Nadie ve quién va a un evento: solo cuántos. Si es en una casa, se muestra solo una zona aproximada.
        </Text>
      </View>
    </Screen>
  );
}
