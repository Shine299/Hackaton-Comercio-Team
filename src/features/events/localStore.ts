import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useOutboxStore } from '@/features/outbox';
import { kvStorage } from '@/shared/storage/kv';
import type { SyncStatus } from '@/shared/sync/status';

import type { LocalRsvp, SectorEvent } from './types';

/** Lo que se crea para un evento nuevo (el id lo genera el cliente: reintentar no duplica). */
export type NewEvent = {
  id: string;
  sectorId: string;
  title: string;
  body: string;
  startsAt: number;
  venueKind: NonNullable<SectorEvent['venueKind']>;
  venueName: string;
  organizerName: string;
};

type EventsLocalState = {
  /** Eventos creados en este teléfono, con su estado de envío. */
  created: SectorEvent[];
  /** Mi «Voy» / «Ya no voy» por evento, con su estado de envío. */
  rsvps: Record<string, LocalRsvp>;
  /** Mis eventos cancelados (dejan de verse al instante). */
  cancelledIds: string[];
  /** Crea el evento: queda «Guardado en tu teléfono» y sale por la cola si hay servidor. */
  create: (event: NewEvent, options: { server: boolean }) => void;
  /** Marca o retira «Voy». En la demo (o sin servidor) solo queda en el teléfono. */
  setRsvp: (eventId: string, going: boolean, options: { server: boolean }) => void;
  cancel: (eventId: string, options: { server: boolean }) => void;
  setCreatedStatus: (statuses: Record<string, SyncStatus>) => void;
  setRsvpStatus: (statuses: Record<string, SyncStatus>) => void;
};

export const useEventsLocalStore = create<EventsLocalState>()(
  persist(
    (set) => ({
      created: [],
      rsvps: {},
      cancelledIds: [],
      create: (event, { server }) => {
        const local: SectorEvent = {
          id: event.id,
          kind: 'event',
          title: event.title,
          body: event.body,
          startsAt: event.startsAt,
          placeLabel: event.venueName,
          source: event.organizerName,
          isDemo: false,
          origin: 'neighbor',
          venueKind: event.venueKind,
          goingCount: 0,
          iAmGoing: false,
          isMine: true,
          syncStatus: 'local',
        };
        if (server) {
          useOutboxStore.getState().enqueue(
            'event.create',
            {
              eventId: event.id,
              sectorId: event.sectorId,
              title: event.title,
              body: event.body,
              startsAt: new Date(event.startsAt).toISOString(),
              venueKind: event.venueKind,
              venueName: event.venueName,
            },
            'normal',
          );
        }
        set((state) => ({ created: [local, ...state.created] }));
      },
      setRsvp: (eventId, going, { server }) => {
        if (server) useOutboxStore.getState().enqueue('event.rsvp', { eventId, going }, 'normal');
        set((state) => ({ rsvps: { ...state.rsvps, [eventId]: { going, syncStatus: 'local' } } }));
      },
      cancel: (eventId, { server }) => {
        if (server) useOutboxStore.getState().enqueue('event.cancel', { eventId }, 'normal');
        set((state) => ({ cancelledIds: [...state.cancelledIds, eventId] }));
      },
      setCreatedStatus: (statuses) =>
        set((state) => ({
          created: state.created.map((e) => (statuses[e.id] ? { ...e, syncStatus: statuses[e.id] } : e)),
        })),
      setRsvpStatus: (statuses) =>
        set((state) => {
          const next = { ...state.rsvps };
          for (const [id, status] of Object.entries(statuses))
            if (next[id]) next[id] = { ...next[id], syncStatus: status };
          return { rsvps: next };
        }),
    }),
    { name: 'yunta.events-local.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);
