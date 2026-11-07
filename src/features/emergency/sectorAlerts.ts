import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/shared/supabase/client';

/**
 * Alerta comunitaria REAL activada desde el servidor por una persona u organización autorizada
 * (tabla `sector_alerts`, solo lectura para la app). Sin servidor o sin alertas activas no se muestra
 * nada: ya no existe el aviso simulado.
 */
export type SectorAlert = {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  /** Quién activó la alerta. Siempre se muestra, para que se sepa de dónde viene. */
  source: string;
  createdAt: number;
};

type Row = { id: string; title: string; body: string; severity: SectorAlert['severity']; source: string; created_at: string };

export const sectorAlertsKey = (sectorId: string) => ['sector-alerts', sectorId] as const;

export async function fetchSectorAlerts(sectorId: string): Promise<SectorAlert[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sector_alerts')
    .select('id,title,body,severity,source,created_at')
    .eq('sector_id', sectorId)
    .order('created_at', { ascending: false })
    .limit(10)
    .overrideTypes<Row[]>();
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    severity: r.severity,
    source: r.source,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

/** Alertas activas del sector. Se refrescan cada minuto mientras la pantalla esté abierta. */
export function useSectorAlerts(sectorId: string) {
  return useQuery({
    queryKey: sectorAlertsKey(sectorId),
    queryFn: () => fetchSectorAlerts(sectorId),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
