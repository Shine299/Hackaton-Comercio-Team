import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { useRegistrationGate } from '@/features/session';
import { isSupabaseConfigured } from '@/shared/supabase/client';
import { Button, Card, Icon, Screen, ScreenHeader, SyncStatusBadge, Text } from '@/shared/ui';

import { EventCard, goingLabel } from './EventCard';
import { useEventsLocalStore } from './localStore';
import { canRsvp } from './logic';
import { useSectorEvents } from './sectorEvents';

/**
 * Detalle de un evento (SPEC-046): «Voy» / «Ya no voy» para los de vecinos, «Cancelar evento» para el tuyo.
 * El conteo es siempre el del servidor; tu «Voy» se ve al instante con su estado de envío.
 */
export function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const eventId = String(id ?? '');
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading } = useSectorEvents(sector.id, sector.name);
  const { requireRegistration, sheet } = useRegistrationGate();
  const setRsvp = useEventsLocalStore((s) => s.setRsvp);
  const cancel = useEventsLocalStore((s) => s.cancel);

  const now = data?.fetchedAt ?? 0;
  const event = data?.events.find((e) => e.id === eventId);
  // Solo lo real va al servidor: la demostración y lo que no tiene servidor se quedan en el teléfono.
  const server = Boolean(event && isSupabaseConfigured && !event.isDemo);

  const onRsvp = (going: boolean) =>
    requireRegistration('Para confirmar que vas, crea tu cuenta vecinal (solo un nombre público).', () =>
      setRsvp(eventId, going, { server }),
    );

  const onCancel = () =>
    Alert.alert('¿Cancelar tu evento?', 'Dejará de verse para tus vecinos. No se puede deshacer.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar evento',
        style: 'destructive',
        onPress: () => {
          cancel(eventId, { server });
          router.back();
        },
      },
    ]);

  const footer = !event ? undefined : event.isMine ? (
    <Button label="Cancelar evento" variant="outline" icon="calendar-remove" onPress={onCancel} />
  ) : canRsvp(event, now) ? (
    event.iAmGoing ? (
      <Button label="Ya no voy" variant="outline" icon="close" onPress={() => onRsvp(false)} />
    ) : (
      <Button label="Voy" size="lg" icon="check" onPress={() => onRsvp(true)} />
    )
  ) : undefined;

  return (
    <Screen header={<ScreenHeader title="Evento" backLabel="Volver a Eventos" />} safeBottom footer={footer}>
      {isLoading ? (
        <View className="items-center py-10">
          <ActivityIndicator />
        </View>
      ) : !event ? (
        <Card>
          <Text variant="headline-sm">No encontramos este evento</Text>
          <Text tone="muted">Puede haber terminado o haberse cancelado. Vuelve a Eventos para ver otros.</Text>
        </Card>
      ) : (
        <View className="gap-4">
          <EventCard event={event} now={now} />

          {event.origin === 'neighbor' ? (
            <Card tone="low" className="gap-2">
              <View className="flex-row items-center gap-2">
                <Icon name="account-group-outline" size={22} color="primary" />
                <Text variant="body-lg-bold" className="flex-1">
                  {goingLabel(event.goingCount)}
                </Text>
              </View>
              {event.myRsvp ? (
                <View className="gap-1">
                  <Text tone="muted">
                    {event.myRsvp.going ? 'Marcaste «Voy».' : 'Retiraste tu asistencia.'} El número cambia cuando el
                    servidor lo recibe.
                  </Text>
                  <SyncStatusBadge status={event.myRsvp.syncStatus} />
                </View>
              ) : null}
              <Text variant="label-md" tone="muted">
                Nadie ve quién va, ni siquiera quien organiza: solo el número.
              </Text>
            </Card>
          ) : (
            <Card tone="low" className="flex-row items-start gap-2">
              <Icon name="door-open" size={20} color="primary" />
              <Text variant="label-md" tone="muted" className="flex-1">
                Evento abierto: no necesitas registrarte. Lo organiza {event.source}.
              </Text>
            </Card>
          )}

          {event.isMine && event.syncStatus === 'local' && !isSupabaseConfigured ? (
            <Card tone="warning">
              <Text tone="muted">
                Sin servidor configurado, tu evento solo existe en este teléfono: tus vecinos no lo ven todavía.
              </Text>
            </Card>
          ) : null}

          {event.venueKind === 'approx_zone' ? (
            <View className="flex-row items-start gap-2 px-1">
              <Icon name="home-map-marker" size={18} color="primary" />
              <Text variant="label-md" tone="muted" className="flex-1">
                Es en una casa: solo se muestra la zona. La dirección se coordina directamente con quien organiza.
              </Text>
            </View>
          ) : null}
        </View>
      )}
      {sheet}
    </Screen>
  );
}
