import { usePathname, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { backFallbackFor } from './backFallback';

/**
 * «Atrás» de las cabeceras (SPEC-055): con historial vuelve a la pantalla anterior; sin historial (notificación, enlace,
 * recarga) cae al inicio de la sección de la pantalla, no al Inicio general.
 */
export function useGoBack(): () => void {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(backFallbackFor(pathname));
  }, [router, pathname]);
}
