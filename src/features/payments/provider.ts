import NetInfo from '@react-native-community/netinfo';

import { createMockProvider } from './mockProvider';
import type { ChargeRequest, ChargeResult, PaymentsProvider } from './types';

/** Sin respuesta en este tiempo, el intento cuenta como fallido (y no se cobró). */
export const CHARGE_TIMEOUT_MS = 20_000;

async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected !== false && state.isInternetReachable !== false;
  } catch {
    return false;
  }
}

/**
 * Proveedor activo. Hoy siempre el simulado; con SPEC-036 se elegirá Culqi (sandbox) cuando haya
 * Supabase y `EXPO_PUBLIC_PAYMENTS=culqi`.
 */
export const paymentsProvider: PaymentsProvider = createMockProvider({ isOnline });

/** Cobra con un tope de tiempo. Nunca lanza: cualquier problema es `failed`. */
export async function chargeWithTimeout(req: ChargeRequest, provider: PaymentsProvider = paymentsProvider): Promise<ChargeResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<ChargeResult>((resolve) => {
    timer = setTimeout(() => resolve({ status: 'failed', reason: 'timeout', mode: provider.mode }), CHARGE_TIMEOUT_MS);
  });
  try {
    return await Promise.race([provider.charge(req), timeout]);
  } catch {
    return { status: 'failed', reason: 'error', mode: provider.mode };
  } finally {
    clearTimeout(timer);
  }
}
