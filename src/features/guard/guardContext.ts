import { createContext, useContext } from 'react';

import type { useGuardMode } from './useGuardMode';

export type GuardApi = ReturnType<typeof useGuardMode>;

export const GuardContext = createContext<GuardApi | null>(null);

/** El Modo guardia que corre en el diseño raíz (`GuardProvider`). Se usa desde cualquier pantalla. */
export function useGuard(): GuardApi {
  const guard = useContext(GuardContext);
  if (!guard) throw new Error('useGuard debe usarse dentro de <GuardProvider> (diseño raíz).');
  return guard;
}
