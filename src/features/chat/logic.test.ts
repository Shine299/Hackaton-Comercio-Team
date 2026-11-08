import { canStartChat, chatModeFor, checkMessageBody, demoConversationIdFor, demoReply, mergeMessages, startChatErrorText } from './logic';
import type { ChatMessage } from './types';

const msg = (id: string, createdAt: number, extra: Partial<ChatMessage> = {}): ChatMessage => ({
  id,
  conversationId: 'c1',
  body: id,
  createdAt,
  mine: true,
  ...extra,
});

// SPEC-045: «Escribir» abre el chat sin solicitud previa.
const UUID = '3f1c2a9e-8b7d-4c6e-9a1b-2c3d4e5f6a7b';
const target = (extra: Partial<Parameters<typeof canStartChat>[0]> = {}) => ({ id: UUID, isOwn: false, status: 'active', isDemo: false, ...extra });

describe('canStartChat', () => {
  it('se puede escribir en una publicación activa de otra persona', () => {
    expect(canStartChat(target())).toBe(true);
  });

  it('no en la propia ni en una que no está activa', () => {
    expect(canStartChat(target({ isOwn: true }))).toBe(false);
    for (const status of ['paused', 'closed', 'completed', 'expired', 'in_coordination']) {
      expect(canStartChat(target({ status }))).toBe(false);
    }
  });
});

describe('chatModeFor', () => {
  it('con servidor y una publicación real, el chat es real', () => {
    expect(chatModeFor(target(), true)).toBe('server');
  });

  it('sin servidor, con una publicación de demo o con un id que no es UUID, el chat es de demostración', () => {
    expect(chatModeFor(target(), false)).toBe('demo');
    expect(chatModeFor(target({ isDemo: true }), true)).toBe('demo');
    expect(chatModeFor(target({ id: 'demo-p1' }), true)).toBe('demo');
  });
});

describe('demoConversationIdFor', () => {
  it('una sola conversación de demo por publicación', () => {
    expect(demoConversationIdFor('demo-p1')).toBe(demoConversationIdFor('demo-p1'));
    expect(demoConversationIdFor('demo-p1')).not.toBe(demoConversationIdFor('demo-p2'));
    expect(demoConversationIdFor('demo-p1').startsWith('demo-conv-')).toBe(true);
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

describe('startChatErrorText', () => {
  it('muestra tal cual los motivos que da el servidor', () => {
    expect(startChatErrorText('No puedes escribir a este vecino')).toBe('No puedes escribir a este vecino.');
    expect(startChatErrorText('Esta publicación ya no está activa')).toBe('Esta publicación ya no está activa.');
  });

  it('cualquier otro error se explica como falta de conexión (sin detalles técnicos)', () => {
    expect(startChatErrorText('TypeError: Network request failed')).toBe(
      'No se pudo abrir el chat. Revisa tu conexión e inténtalo de nuevo.',
    );
  });
});
