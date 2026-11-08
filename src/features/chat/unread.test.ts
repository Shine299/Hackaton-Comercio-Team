import { freshUnread, unreadConversationIds } from './unread';

// SPEC-048: chat sin leer.
const conv = (id: string, lastAt: number, lastFromMe = false) => ({ id, lastAt, lastFromMe });
const SINCE = 1_000;

describe('unreadConversationIds', () => {
  it('cuenta lo que escribió la otra persona después de la última vez que abrí el chat', () => {
    const ids = unreadConversationIds([conv('a', 5_000), conv('b', 5_000)], { a: 6_000, b: 4_000 }, SINCE);
    expect(ids).toEqual(['b']);
  });

  it('mis propios mensajes nunca cuentan como sin leer', () => {
    expect(unreadConversationIds([conv('a', 5_000, true)], {}, SINCE)).toEqual([]);
  });

  it('lo anterior a esta versión no aparece como sin leer (y sin mensajes tampoco)', () => {
    expect(unreadConversationIds([conv('vieja', 500), conv('vacia', 0)], {}, SINCE)).toEqual([]);
    expect(unreadConversationIds([conv('nueva', 2_000)], {}, SINCE)).toEqual(['nueva']);
  });
});

describe('freshUnread', () => {
  it('solo es «nuevo» para notificar lo que no estaba sin leer antes, o lo que trae un mensaje más reciente', () => {
    const before = { a: 5_000, b: 5_000 };
    const after = { a: 5_000, b: 7_000, c: 8_000 };
    expect(freshUnread(before, after).sort()).toEqual(['b', 'c']);
  });

  it('la primera foto (al abrir la app) no notifica', () => {
    expect(freshUnread(null, { a: 5_000 })).toEqual([]);
  });
});
