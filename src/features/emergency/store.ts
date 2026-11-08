import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useOutboxStore } from '@/features/outbox';
import { useSectorStore } from '@/features/sector';
import { kvStorage } from '@/shared/storage/kv';

import { sanitizePeople } from './people';
import {
  INCIDENT_FLOW,
  RESOURCE_STAGES,
  type AtRisk,
  type EmergencyReport,
  type PeopleCount,
  type HelpType,
  type IncidentCategory,
  type IncidentStatus,
  type ResourceStage,
  type ResourceKind,
  type ReportBasis,
  type ResourceOffer,
  type VulnerableAlert,
  type VulnerableNeed,
} from './types';

type PeopleInput = { peopleCount?: PeopleCount; peopleAtRisk?: AtRisk };
type HelpInput = { type: HelpType; immediateDanger: boolean; detail?: string; photoUri?: string } & PeopleInput;
type IncidentInput = { category: IncidentCategory; detail?: string; photoUri?: string } & PeopleInput;

type VulnerableInput = {
  need: VulnerableNeed;
  basis: ReportBasis;
  detail?: string;
  diagnosis?: string;
  photoUri?: string;
  voiceUri?: string;
};

export type ServerPatch = {
  reports?: Record<string, IncidentStatus>;
  vulnerable?: Record<string, IncidentStatus>;
  offers?: Record<string, { stage?: ResourceStage; quantity?: number; delivered?: number; synced?: boolean }>;
};

const RANK_OF = (s: IncidentStatus) => INCIDENT_FLOW.indexOf(s as (typeof INCIDENT_FLOW)[number]);

/** El estado del servidor solo puede avanzar un reporte, nunca devolverlo a «local». */
const advanced = (current: IncidentStatus, next: IncidentStatus) =>
  current === 'local' || current === 'pending' || RANK_OF(next) >= RANK_OF(current) || RANK_OF(next) < 0 ? next : current;

type EmergencyState = {
  reports: EmergencyReport[];
  vulnerable: VulnerableAlert[];
  offers: ResourceOffer[];
  addHelp: (input: HelpInput) => EmergencyReport;
  addIncident: (input: IncidentInput) => EmergencyReport;
  addVulnerable: (input: VulnerableInput) => VulnerableAlert;
  addOffer: (resource: ResourceKind, note: string, quantity?: number) => ResourceOffer;
  /** Oferta activa (no cancelada ni confirmada) del mismo recurso en el sector actual, si existe. */
  findActiveOffer: (resource: ResourceKind) => ResourceOffer | undefined;
  /** Suma unidades a una oferta existente en vez de crear una duplicada. */
  addQuantity: (id: string, extra: number) => void;
  /** Registra una entrega parcial. Nunca supera la cantidad ofrecida. */
  registerDelivery: (id: string, units: number) => void;
  advanceOffer: (id: string) => void;
  cancelOffer: (id: string) => void;
  /** Aplica lo que respondió el servidor (estado de envío, etapa, cantidades). */
  applyServer: (patch: ServerPatch) => void;
};

/** Zona aproximada: solo el sector elegido. Nunca se leen ni guardan coordenadas del dispositivo. */
function currentZone() {
  const { sector } = useSectorStore.getState();
  return { sectorId: sector.id, sectorName: sector.name };
}

/**
 * Reportes de emergencia y ofertas de recursos, solo en el teléfono.
 * Cada envío entra a la cola local con prioridad `emergency` o `urgent`. Sin servidor, el estado
 * real es siempre `local`: la UI nunca lo presenta como recibido.
 */
export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set, get) => ({
      reports: [],
      vulnerable: [],
      offers: [],
      addHelp: ({ type, immediateDanger, detail = '', photoUri, peopleCount, peopleAtRisk }) => {
        const id = Crypto.randomUUID();
        const zone = currentZone();
        const people = sanitizePeople({ peopleCount, peopleAtRisk });
        const outbox = useOutboxStore
          .getState()
          .enqueue('emergency.help', { reportId: id, type, immediateDanger, ...people, ...zone }, immediateDanger ? 'emergency' : 'urgent');
        const report: EmergencyReport = {
          id,
          kind: 'help',
          category: type,
          immediateDanger,
          detail: detail.trim(),
          photoUri: photoUri || undefined,
          ...people,
          ...zone,
          createdAt: Date.now(),
          status: 'local',
          outboxId: outbox.id,
        };
        set((state) => ({ reports: [report, ...state.reports] }));
        return report;
      },
      addIncident: ({ category, detail = '', photoUri, peopleCount, peopleAtRisk }) => {
        const id = Crypto.randomUUID();
        const zone = currentZone();
        const people = sanitizePeople({ peopleCount, peopleAtRisk });
        const outbox = useOutboxStore
          .getState()
          .enqueue('emergency.incident', { reportId: id, category, ...people, ...zone }, 'emergency');
        const report: EmergencyReport = {
          id,
          kind: 'incident',
          category,
          immediateDanger: false,
          detail: detail.trim(),
          photoUri: photoUri || undefined,
          ...people,
          ...zone,
          createdAt: Date.now(),
          status: 'local',
          outboxId: outbox.id,
        };
        set((state) => ({ reports: [report, ...state.reports] }));
        return report;
      },
      addVulnerable: ({ need, basis, detail = '', diagnosis = '', photoUri, voiceUri }) => {
        const id = Crypto.randomUUID();
        const zone = currentZone();
        // La cola solo lleva lo mínimo: nunca el diagnóstico, el detalle ni la foto.
        const outbox = useOutboxStore
          .getState()
          .enqueue(
            'emergency.vulnerable',
            { alertId: id, need, basis, ...zone },
            need === 'medical' || need === 'mobility' ? 'emergency' : 'urgent',
          );
        const alert: VulnerableAlert = {
          id,
          need,
          basis,
          detail: detail.trim(),
          diagnosis: diagnosis.trim(),
          photoUri: photoUri || undefined,
          voiceUsed: Boolean(voiceUri),
          voiceUri: voiceUri || undefined,
          ...zone,
          createdAt: Date.now(),
          status: 'local',
          outboxId: outbox.id,
        };
        set((state) => ({ vulnerable: [alert, ...state.vulnerable] }));
        return alert;
      },
      addOffer: (resource, note, quantity) => {
        const id = Crypto.randomUUID();
        const zone = currentZone();
        const outbox = useOutboxStore
          .getState()
          .enqueue('resource.offer', { offerId: id, resource, quantity, ...zone }, 'urgent');
        const offer: ResourceOffer = {
          id,
          resource,
          note: note.trim(),
          ...zone,
          createdAt: Date.now(),
          stage: 'offered',
          outboxId: outbox.id,
          isDemo: false,
          quantity,
          delivered: quantity ? 0 : undefined,
        };
        set((state) => ({ offers: [offer, ...state.offers] }));
        return offer;
      },
      findActiveOffer: (resource) => {
        const { sector } = useSectorStore.getState();
        return get().offers.find(
          (o) => o.resource === resource && o.sectorId === sector.id && o.stage !== 'cancelled' && o.stage !== 'confirmed',
        );
      },
      addQuantity: (id, extra) => {
        const offer = get().offers.find((o) => o.id === id);
        if (!offer || extra < 1) return;
        const quantity = (offer.quantity ?? 0) + extra;
        useOutboxStore.getState().enqueue('resource.update', { offerId: id, quantity }, 'urgent');
        set((state) => ({
          offers: state.offers.map((o) => (o.id === id ? { ...o, quantity, delivered: o.delivered ?? 0 } : o)),
        }));
      },
      registerDelivery: (id, units) => {
        const offer = get().offers.find((o) => o.id === id);
        if (!offer?.quantity || units < 1) return;
        const delivered = Math.min(offer.quantity, (offer.delivered ?? 0) + units);
        useOutboxStore.getState().enqueue('resource.update', { offerId: id, delivered }, 'urgent');
        set((state) => ({ offers: state.offers.map((o) => (o.id === id ? { ...o, delivered } : o)) }));
      },
      applyServer: (patch) =>
        set((state) => ({
          reports: state.reports.map((r) => {
            const next = patch.reports?.[r.id];
            return next ? { ...r, status: advanced(r.status, next) } : r;
          }),
          vulnerable: state.vulnerable.map((v) => {
            const next = patch.vulnerable?.[v.id];
            return next ? { ...v, status: advanced(v.status, next) } : v;
          }),
          offers: state.offers.map((o) => {
            const p = patch.offers?.[o.id];
            // Si el servidor ya dio una etapa, manda sobre la simulada del teléfono.
            if (!p) return o;
            return {
              ...o,
              ...(p.stage ? { stage: p.stage } : {}),
              ...(p.quantity !== undefined ? { quantity: p.quantity } : {}),
              ...(p.delivered !== undefined ? { delivered: p.delivered } : {}),
              ...(p.synced ? { synced: true } : {}),
            };
          }),
        })),
      advanceOffer: (id) =>
        set((state) => ({
          offers: state.offers.map((o) => {
            if (o.id !== id || o.stage === 'cancelled') return o;
            const idx = RESOURCE_STAGES.indexOf(o.stage);
            const next = RESOURCE_STAGES[idx + 1];
            return next ? { ...o, stage: next } : o;
          }),
        })),
      cancelOffer: (id) => {
        const offer = get().offers.find((o) => o.id === id);
        if (!offer || offer.stage === 'confirmed' || offer.stage === 'cancelled') return;
        useOutboxStore.getState().enqueue('resource.update', { offerId: id, cancel: true }, 'urgent');
        set((state) => ({ offers: state.offers.map((o) => (o.id === id ? { ...o, stage: 'cancelled' } : o)) }));
      },
    }),
    {
      name: 'rvs.emergency.v1',
      storage: createJSONStorage(() => kvStorage),
      partialize: (state) => ({ reports: state.reports, vulnerable: state.vulnerable, offers: state.offers }),
    },
  ),
);
