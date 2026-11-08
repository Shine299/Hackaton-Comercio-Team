import { createMockProvider } from './mockProvider';
import type { ChargeRequest } from './types';

const req = (key = 'k1'): ChargeRequest => ({
  idempotencyKey: key,
  fundId: 'f1',
  amountCents: 2000,
  method: 'yape',
  yape: { phone: '987654321', otp: '123456' },
});

describe('createMockProvider', () => {
  it('confirma un pago válido en modo simulado', async () => {
    const provider = createMockProvider({ isOnline: async () => true, delayMs: 0 });
    expect(provider.mode).toBe('mock');
    const res = await provider.charge(req());
    expect(res.status).toBe('confirmed');
    expect(res.chargeId).toBeTruthy();
  });

  it('sin red falla y no cobra', async () => {
    const provider = createMockProvider({ isOnline: async () => false, delayMs: 0 });
    const res = await provider.charge(req());
    expect(res).toMatchObject({ status: 'failed', reason: 'offline' });
  });

  it('rechaza datos inválidos sin cobrar', async () => {
    const provider = createMockProvider({ isOnline: async () => true, delayMs: 0 });
    const res = await provider.charge({ ...req(), yape: { phone: '1', otp: '1' } });
    expect(res).toMatchObject({ status: 'failed', reason: 'invalid' });
  });

  it('la misma clave devuelve el mismo resultado (no cobra dos veces)', async () => {
    let calls = 0;
    const provider = createMockProvider({
      isOnline: async () => {
        calls += 1;
        return true;
      },
      delayMs: 0,
    });
    const [a, b] = await Promise.all([provider.charge(req('same')), provider.charge(req('same'))]);
    const c = await provider.charge(req('same'));
    expect(a).toEqual(b);
    expect(c).toEqual(a);
    expect(calls).toBe(1);
  });
});
