import { useQuery } from '@tanstack/react-query';

import { useSectorStore } from '@/features/sector';

import { demoFunds } from './demoFunds';
import { fundProgress } from './progress';
import { useContributionsStore } from './store';

/**
 * Fondos del sector. Por ahora solo de demostración; con SPEC-036 se leerán de Supabase y se usarán los de
 * demo solo si no hay servidor. `fetchedAt` fija «ahora» para que los días no salten en cada render.
 */
export function useSectorFunds() {
  const sector = useSectorStore((s) => s.sector);
  return useQuery({
    queryKey: ['funds', sector.id],
    queryFn: async () => {
      const now = Date.now();
      return { funds: demoFunds(sector.id, sector.name, now), fetchedAt: now };
    },
    staleTime: 60_000,
  });
}

/** Avance de un fondo (servidor/demo + aportes de este teléfono), o `undefined` si no existe. */
export function useFundProgress(id: string | null) {
  const { fund, now } = useFund(id ?? '');
  const contributions = useContributionsStore((s) => s.contributions);
  if (!id || !fund) return undefined;
  return { fund, progress: fundProgress(fund, contributions, now) };
}

export function useFund(id: string) {
  const query = useSectorFunds();
  return {
    ...query,
    fund: query.data?.funds.find((f) => f.id === id),
    now: query.data?.fetchedAt ?? 0,
  };
}
