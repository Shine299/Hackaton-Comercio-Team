import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSessionStore } from '@/features/session';
import { ensureAnonymousUser, supabase } from '@/shared/supabase/client';

import {
  getHelpType,
  getIncidentCategory,
  getVulnerableNeed,
  type IncidentStatus,
} from './types';

/**
 * Tablero compartido del sector. Lo que se lee viene de la función `sector_board` del servidor, que
 * solo expone lo no identificable: tipo, sector, estado, hora y cuántos vecinos van en camino.
 * Nunca llegan el detalle, el diagnóstico, la foto ni quién avisó (eso se queda en el teléfono).
 * Sin servidor, o si la función aún no existe, todo devuelve vacío y la app usa lo local y la demo.
 */
export type ResponseState = 'on_the_way' | 'arrived' | 'withdrawn';

export type SharedBoardItem = {
  id: string;
  source: 'vulnerable' | 'help' | 'incident';
  category: string;
  immediateDanger: boolean;
  status: IncidentStatus;
  createdAt: number;
  /** Vecinos que dijeron «voy a ayudar» y no se retiraron. */
  responders: number;
  arrived: number;
  /** Mi propia respuesta, si la hay. */
  iRespond: ResponseState | null;
  /** `true` si el aviso lo creé yo desde esta cuenta. */
  mine: boolean;
  /** Nombres públicos de quienes van en camino: solo los ve quien avisó. */
  responderNames: string[];
};

type Row = {
  id: string;
  source: SharedBoardItem['source'];
  category: string;
  immediate_danger: boolean;
  status: IncidentStatus;
  created_at: string;
  responders: number;
  arrived: number;
  i_respond: ResponseState | null;
  mine: boolean;
  responder_names: string[] | null;
};

/** Texto público e ícono de un aviso. Solo usa tipo y sector: nunca identifica a la persona. */
export function describeSharedItem(item: SharedBoardItem, sectorName: string) {
  if (item.source === 'vulnerable') {
    const need = getVulnerableNeed(item.category);
    return {
      title: `Una persona en ${sectorName} podría necesitar: ${need.label.toLowerCase()}.`,
      icon: need.icon,
    };
  }
  if (item.source === 'help') {
    const help = getHelpType(item.category);
    return {
      title: item.immediateDanger ? 'Alerta de peligro inmediato' : `Necesito ayuda: ${help.label.toLowerCase()}`,
      icon: item.immediateDanger ? ('alarm-light-outline' as const) : help.icon,
    };
  }
  const incident = getIncidentCategory(item.category);
  return { title: incident.label, icon: incident.icon };
}

export const sharedBoardKey =(sectorId: string) => ['shared-board', sectorId] as const;
export const sectorImpactKey = (sectorId: string) => ['sector-impact', sectorId] as const;

export async function fetchSharedBoard(sectorId: string): Promise<SharedBoardItem[]> {
  if (!supabase) return [];
  try {
    await ensureAnonymousUser();
  } catch {
    // Sin sesión se puede leer el tablero, pero no marcar lo propio.
  }
  const { data, error } = await supabase.rpc('sector_board', { p_sector_id: sectorId });
  if (error || !Array.isArray(data)) return [];
  return (data as Row[]).map((r) => ({
    id: r.id,
    source: r.source,
    category: r.category,
    immediateDanger: r.immediate_danger,
    status: r.status,
    createdAt: new Date(r.created_at).getTime(),
    responders: r.responders,
    arrived: r.arrived,
    iRespond: r.i_respond,
    mine: r.mine,
    responderNames: r.responder_names ?? [],
  }));
}

/** El tablero se refresca cada 8 segundos mientras la pantalla está abierta. */
export function useSharedBoard(sectorId: string) {
  return useQuery({
    queryKey: sharedBoardKey(sectorId),
    queryFn: () => fetchSharedBoard(sectorId),
    refetchInterval: 8_000,
    staleTime: 4_000,
  });
}

export type SectorImpact = { resolvedToday: number; respondersToday: number };

export function useSectorImpact(sectorId: string) {
  return useQuery({
    queryKey: sectorImpactKey(sectorId),
    queryFn: async (): Promise<SectorImpact> => {
      if (!supabase) return { resolvedToday: 0, respondersToday: 0 };
      const { data, error } = await supabase.rpc('sector_impact', { p_sector_id: sectorId });
      const row = Array.isArray(data) ? data[0] : null;
      if (error || !row) return { resolvedToday: 0, respondersToday: 0 };
      return { resolvedToday: row.resolved_today ?? 0, respondersToday: row.responders_today ?? 0 };
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

/** «Voy a ayudar», «Ya llegué» o «Ya no puedo ir». Solo cuenta si el servidor responde. */
export function useRespondToItem(sectorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetId, status }: { targetId: string; status: ResponseState }) => {
      if (!supabase) throw new Error('Sin servidor configurado');
      await ensureAnonymousUser();
      const { error } = await supabase.rpc('respond_to_board_item', {
        p_target_id: targetId,
        p_status: status,
        p_display_name: useSessionStore.getState().displayName || 'Un vecino',
      });
      if (error) throw new Error(error.message);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: sharedBoardKey(sectorId) });
      void qc.invalidateQueries({ queryKey: sectorImpactKey(sectorId) });
    },
  });
}

/** Quien avisó confirma que ya fue atendido. */
export function useResolveMyItem(sectorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      if (!supabase) throw new Error('Sin servidor configurado');
      await ensureAnonymousUser();
      const { error } = await supabase.rpc('resolve_my_board_item', { p_target_id: targetId });
      if (error) throw new Error(error.message);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: sharedBoardKey(sectorId) });
      void qc.invalidateQueries({ queryKey: sectorImpactKey(sectorId) });
    },
  });
}
