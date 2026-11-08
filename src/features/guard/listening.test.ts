import { pauseReason, shouldListen } from './listening';

const on = { enabled: true, consented: true, appActive: true, micBusy: false, onboarded: true };

describe('shouldListen (SPEC-052: escucha mientras se usa la app)', () => {
  it('escucha cuando está activada, con consentimiento, la app a la vista y el micrófono libre', () => {
    expect(shouldListen(on)).toBe(true);
  });

  it('no escucha si la persona no la activó o no dio su consentimiento', () => {
    expect(shouldListen({ ...on, enabled: false })).toBe(false);
    expect(shouldListen({ ...on, consented: false })).toBe(false);
  });

  it('no escucha con la app en segundo plano ni con el teléfono bloqueado', () => {
    expect(shouldListen({ ...on, appActive: false })).toBe(false);
  });

  it('se aparta cuando otra función usa el micrófono (asistente o nota de voz)', () => {
    expect(shouldListen({ ...on, micBusy: true })).toBe(false);
  });

  it('no escucha durante el tutorial inicial', () => {
    expect(shouldListen({ ...on, onboarded: false })).toBe(false);
  });
});

describe('pauseReason (diagnóstico: por qué no está escuchando)', () => {
  const ok = { enabled: true, consented: true, appActive: true, micBusy: false, onboarded: true };

  it('sin motivo cuando escucha', () => {
    expect(pauseReason(ok)).toBeNull();
  });

  it('explica cada motivo en palabras de la persona', () => {
    expect(pauseReason({ ...ok, enabled: false })).toBe('La guardia está apagada.');
    expect(pauseReason({ ...ok, consented: false })).toBe('Falta tu consentimiento.');
    expect(pauseReason({ ...ok, onboarded: false })).toBe('Estás en el tutorial inicial.');
    expect(pauseReason({ ...ok, appActive: false })).toBe('La app está en segundo plano.');
    expect(pauseReason({ ...ok, micBusy: true })).toBe('Otra función está usando el micrófono (nota de voz, asistente o conversación).');
  });
});
