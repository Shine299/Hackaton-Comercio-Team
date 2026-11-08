import { canOpenChat, checkMessageBody, demoReply, mergeMessages } from './logic';
import type { ChatMessage } from './types';

const msg = (id: string, createdAt: number, extra: Partial<ChatMessage> = {}): ChatMessage => ({
  id,
  conversationId: 'c1',
  body: id,
  createdAt,
  mine: true,
  ...extra,
});

describe('canOpenChat', () => {
  it('solo se abre cuando la solicitud fue aceptada', () => {
    expect(canOpenChat({ status: 'accepted' })).toBe(true);
    expect(canOpenChat({ status: 'received' })).toBe(false);
    expect(canOpenChat({ status: 'declined' })).toBe(false);
  });
});

describe('checkMessageBody', () => {
  it('rechaza vacío o solo espacios', () => {
    expect(checkMessageBody('   \n ').ok).toBe(false);
  });

  it('limpia espacios y saltos repetidos', () => {
    expect(checkMessageBody('  hola   \n  vecino ')).toEqual({ ok: true, body: 'hola vecino' });
  });

  it('rechaza mensajes de más de 500 caracteres', () => {
    expect(checkMessageBody('a'.repeat(501)).ok).toBe(false);
    expect(checkMessageBody('a'.repeat(500)).ok).toBe(true);
  });
});

describe('mergeMessages', () => {
  it('ordena del más antiguo al más reciente', () => {
    const out = mergeMessages([msg('b', 20)], [msg('a', 10), msg('c', 30)]);
    expect(out.map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('si el servidor ya tiene el mensaje, gana el del servidor y deja de estar «local»', () => {
    const local = msg('x', 10, { syncStatus: 'local' });
    const server = msg('x', 11, { syncStatus: undefined });
    const out = mergeMessages([server], [local]);
    expect(out).toHaveLength(1);
    expect(out[0].syncStatus).toBeUndefined();
    expect(out[0].createdAt).toBe(11);
  });

  it('conserva lo que solo está en el teléfono (aún no llegó)', () => {
    const out = mergeMessages([], [msg('solo-local', 5, { syncStatus: 'local' })]);
    expect(out[0].syncStatus).toBe('local');
  });
});

describe('demoReply', () => {
  it('responde según cuántos mensajes enviaste y se acaba', () => {
    expect(demoReply(1)).toContain('disponible');
    expect(demoReply(3)).toBeDefined();
    expect(demoReply(4)).toBeUndefined();
    expect(demoReply(0)).toBeUndefined();
  });
});
