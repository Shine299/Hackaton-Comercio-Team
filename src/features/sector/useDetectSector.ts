import { useCallback, useState } from 'react';

import { detectSector, type DetectResult } from './detectSector';
import { useSectorStore } from './store';

export type DetectState = { phase: 'idle' } | { phase: 'loading' } | { phase: 'done'; result: DetectResult };

/** Ejecuta la detección por GPS y, si coincide con un sector, lo guarda. */
export function useDetectSector() {
  const setSector = useSectorStore((s) => s.setSector);
  const [state, setState] = useState<DetectState>({ phase: 'idle' });

  const detect = useCallback(async () => {
    setState({ phase: 'loading' });
    const result = await detectSector();
    if (result.status === 'ok') setSector(result.sector);
    setState({ phase: 'done', result });
  }, [setSector]);

  return { state, detect };
}
