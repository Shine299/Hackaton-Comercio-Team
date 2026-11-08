import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Badge, DemoTag, GRADIENTS, Icon, ListenButton, PressableScale, SyncStatusBadge, Text } from '@/shared/ui';

import { eventDateParts } from './sectorEvents';
import type { SectorEvent } from './types';

type Props = {
  event: SectorEvent;
  now: number;
  /** Versión corta para Inicio: sin descripción ni «Escuchar». */
  compact?: boolean;
  onPress?: () => void;
};

/** «N vecinos van»: solo el número, nunca quiénes (SPEC-046). */
export function goingLabel(count: number): string {
  if (count === 0) return 'Aún nadie confirmó';
  return count === 1 ? '1 vecino va' : `${count} vecinos van`;
}

/**
 * Evento o aviso del barrio: bloque de calendario grande, qué es, dónde y quién lo organiza. En los de vecinos,
 * cuántos van y si tú vas (con su estado de envío honesto).
 */
export function EventCard({ event, now, compact = false, onPress }: Props) {
  const date = eventDateParts(event.startsAt, now);
  const gradient = event.kind === 'notice' ? GRADIENTS.emergencia : GRADIENTS.recomendado;
  const neighbor = event.origin === 'neighbor';
  const place = event.venueKind === 'approx_zone' ? `Zona aproximada: ${event.placeLabel}` : event.placeLabel;
  const spoken = [
    `${event.title}. ${date.when}, ${date.day} de ${date.month.toLowerCase()}, a las ${date.time}. En ${place}.`,
    compact ? '' : event.body,
    `Organiza: ${event.source}.`,
    neighbor ? `${goingLabel(event.goingCount)}.` : '',
    event.isMine ? 'Es tu evento.' : event.iAmGoing ? 'Vas a ir.' : '',
    event.isDemo ? 'Dato de demostración.' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <View className="flex-row gap-3.5 rounded-3xl bg-surface-container-lowest p-3.5 shadow-sm elevation-xs">
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
        <Text variant="label-sm" tone="onPrimary">
          {date.month}
        </Text>
        <Text variant="display" tone="onPrimary">
          {date.day}
        </Text>
        <Text variant="label-sm" tone="onPrimary" numberOfLines={1}>
          {date.when}
        </Text>
      </LinearGradient>
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Icon name={event.kind === 'notice' ? 'bullhorn-outline' : 'calendar-star'} size={16} color="primary" />
          <Text variant="label-md" tone="primary">
            {event.kind === 'notice' ? 'Aviso' : 'Evento'} · {date.time}
          </Text>
        </View>
        <Text variant="body-lg-bold" numberOfLines={compact ? 2 : 3}>
          {event.title}
        </Text>
        <View className="flex-row items-center gap-1">
          <Icon name="map-marker-outline" size={15} color="onSurfaceVariant" />
          <Text variant="label-md" tone="muted" className="flex-1" numberOfLines={1}>
            {place}
          </Text>
        </View>
        {neighbor || event.syncStatus ? (
          <View className="flex-row flex-wrap items-center gap-2">
            {neighbor ? (
              <View className="flex-row items-center gap-1">
                <Icon name="account-group-outline" size={15} color="onSurfaceVariant" />
                <Text variant="label-md" tone="muted">
                  {goingLabel(event.goingCount)}
                </Text>
              </View>
            ) : null}
            {event.isMine ? <Badge label="Tu evento" tone="neutral" icon="star-outline" /> : null}
            {!event.isMine && event.iAmGoing ? <Badge label="Vas" tone="primary" icon="check" /> : null}
            {event.myRsvp ? <SyncStatusBadge status={event.myRsvp.syncStatus} /> : null}
            {event.syncStatus ? <SyncStatusBadge status={event.syncStatus} /> : null}
          </View>
        ) : null}
        {compact ? null : (
          <>
            {event.body ? <Text tone="muted">{event.body}</Text> : null}
            <View className="flex-row flex-wrap items-center gap-2">
              <Text variant="label-md" tone="muted">
                Organiza: {event.source}
              </Text>
              {event.isDemo ? <DemoTag /> : null}
            </View>
            <ListenButton text={spoken} />
          </>
        )}
      </View>
    </View>
  );

  if (!onPress)
    return (
      <View accessible accessibilityLabel={spoken}>
        {content}
      </View>
    );
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={spoken}
      onPress={onPress}
      className="active:opacity-90">
      {content}
    </PressableScale>
  );
}
