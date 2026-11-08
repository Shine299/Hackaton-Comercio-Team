import type { LatLng, MapPoint } from '@/features/map';

import { eventDateParts } from './sectorEvents';
import type { SectorEvent } from './types';

/**
 * Eventos como puntos del mapa. Los eventos no guardan coordenadas (una casa nunca muestra su dirección): `locate`
 * da a cada uno una zona aproximada y estable alrededor del centro del sector (`approxPoint` de `features/map`).
 */
export function eventMapPoints(events: SectorEvent[], now: number, locate: (eventId: string) => LatLng): MapPoint[] {
  return events.map((event) => {
    const when = eventDateParts(event.startsAt, now);
    const place = event.venueKind === 'approx_zone' ? `Zona aproximada: ${event.placeLabel}` : event.placeLabel;
    return {
      id: `event:${event.id}`,
      layer: 'events' as const,
      title: event.title,
      detail: `${when.when}, ${when.day} ${when.month} · ${when.time} · ${place}`,
      coord: locate(event.id),
      isDemo: event.isDemo,
      source: event.source,
      target: { kind: 'event' as const, id: event.id },
    };
  });
}
