import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { DemoTag, GRADIENTS, Icon, ListenButton, Text, PressableScale } from '@/shared/ui';

import { eventDateParts, type SectorEvent } from './sectorEvents';

type Props = {
  event: SectorEvent;
  now: number;
  /** Versión corta para Inicio: sin descripción ni «Escuchar». */
  compact?: boolean;
  onPress?: () => void;
};

/** Evento o aviso del barrio: bloque de calendario grande, qué es, dónde y quién lo organiza. */
export function EventCard({ event, now, compact = false, onPress }: Props) {
  const date = eventDateParts(event.startsAt, now);
  const gradient = event.kind === 'notice' ? GRADIENTS.emergencia : GRADIENTS.recomendado;
  const spoken = `${event.title}. ${date.when}, ${date.day} de ${date.month.toLowerCase()}, a las ${date.time}. En ${event.placeLabel}. ${event.body} Organiza: ${event.source}.`;

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
            {event.placeLabel}
          </Text>
        </View>
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

  if (!onPress) return <View accessible accessibilityLabel={spoken}>{content}</View>;
  return (
    <PressableScale accessibilityRole="button" accessibilityLabel={spoken} onPress={onPress} className="active:opacity-90">
      {content}
    </PressableScale>
  );
}
