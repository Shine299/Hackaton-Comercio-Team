import type { ChargeRequest, ChargeResult, PaymentsProvider } from './types';
import { validateYapeCharge } from './validate';

type MockOptions = {
  /** Cómo saber si hay red. Sin red el pago falla: nunca se «guarda para después». */
  isOnline: () => Promise<boolean>;
  /** Espera simulada de la pasarela. */
  delayMs?: number;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Proveedor simulado para cuando no hay pasarela configurada. No mueve dinero: la app lo muestra
 * siempre como «Pago simulado». Respeta las mismas reglas que el real: sin red falla, datos inválidos
 * fallan, y la misma `idempotencyKey` devuelve el mismo resultado.
 */
export function createMockProvider({ isOnline, delayMs = 1500 }: MockOptions): PaymentsProvider {
  const results = new Map<string, Promise<ChargeResult>>();

  const run = async (req: ChargeRequest): Promise<ChargeResult> => {
    if (validateYapeCharge({ amountCents: req.amountCents, phone: req.yape.phone, otp: req.yape.otp })) {
      return { status: 'failed', reason: 'invalid', mode: 'mock' };
    }
    if (!(await isOnline())) return { status: 'failed', reason: 'offline', mode: 'mock' };
    await wait(delayMs);
    return { status: 'confirmed', chargeId: `mock_${req.idempotencyKey}`, mode: 'mock' };
  };

  return {
    mode: 'mock',
    charge(req) {
      const existing = results.get(req.idempotencyKey);
      if (existing) return existing;
      const pending = run(req);
      results.set(req.idempotencyKey, pending);
      return pending;
    },
  };
}
