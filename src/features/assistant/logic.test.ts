import { checkQuestion, faqAnswer, looksLikeEmergency, redactPersonalData, resolveAnswer } from './logic';

// SPEC-049: asistente con IA gratuita.
describe('looksLikeEmergency', () => {
  it('detecta frases de emergencia (sin tildes ni mayúsculas)', () => {
    for (const text of ['Se está QUEMANDO la casa', 'mi mamá no respira', 'me estan robando', 'hay un incendio', 'Auxilio!', 'hay un herido grave']) {
      expect(looksLikeEmergency(text)).toBe(true);
    }
  });

  it('no confunde preguntas normales', () => {
    for (const text of ['¿Cómo publico algo?', '¿Qué eventos hay?', 'quiero prestar mi escalera', '¿Qué es el SOS?']) {
      expect(looksLikeEmergency(text)).toBe(false);
    }
  });
});

describe('redactPersonalData', () => {
  it('oculta teléfonos, correos y DNI antes de enviar', () => {
    const out = redactPersonalData('Llámame al 987 654 321 o escribe a rosa.m@gmail.com, mi DNI es 45678912');
    expect(out.text).not.toMatch(/987|654|321|gmail|45678912/);
    expect(out.text.match(/\[dato oculto\]/g)).toHaveLength(3);
    expect(out.redacted).toBe(true);
  });

  it('deja intacto un texto sin datos personales', () => {
    expect(redactPersonalData('¿Cómo creo un evento para el sábado a las 5?')).toEqual({
      text: '¿Cómo creo un evento para el sábado a las 5?',
      redacted: false,
    });
  });
});

describe('checkQuestion', () => {
  it('limpia espacios y rechaza vacío o más de 500 caracteres', () => {
    expect(checkQuestion('  hola  ')).toEqual({ ok: true, text: 'hola' });
    expect(checkQuestion('   ').ok).toBe(false);
    expect(checkQuestion('a'.repeat(501)).ok).toBe(false);
  });
});

describe('faqAnswer', () => {
  it('responde las dudas frecuentes sin IA', () => {
    expect(faqAnswer('¿Cómo publico algo?')).toMatch(/Marketplace/);
    expect(faqAnswer('como creo un evento')).toMatch(/Eventos/);
    expect(faqAnswer('¿para qué sirve el SOS?')).toMatch(/105/);
  });

  it('si no sabe, lo dice y sugiere dónde mirar', () => {
    expect(faqAnswer('¿cuál es la capital de Mongolia?')).toMatch(/no tengo una respuesta/i);
  });
});

describe('resolveAnswer', () => {
  const never = async () => {
    throw new Error('no debía llamar a la IA');
  };

  it('una emergencia no pasa por la IA', async () => {
    const out = await resolveAnswer('¡Hay un incendio en mi cuadra!', [], { serverConfigured: true, ask: never });
    expect(out.source).toBe('emergency');
    expect(out.text).toMatch(/105/);
  });

  it('oculta los datos personales antes de enviarlos', async () => {
    let sent = '';
    const out = await resolveAnswer('mi número es 987654321, ¿cómo publico?', [], {
      serverConfigured: true,
      ask: async (history) => {
        sent = history[history.length - 1].text;
        return { text: 'Ve a Marketplace.', provider: 'mistral' };
      },
    });
    expect(sent).not.toMatch(/987654321/);
    expect(out).toMatchObject({ source: 'ai', provider: 'mistral', redacted: true });
  });

  it('sin servidor responde con las respuestas fijas de demostración', async () => {
    const out = await resolveAnswer('¿cómo creo un evento?', [], { serverConfigured: false, ask: never });
    expect(out.source).toBe('demo');
    expect(out.text).toMatch(/Eventos/);
  });

  it('si se acabó el cupo, la IA no está o falla la red: respuestas fijas con el motivo', async () => {
    const limit = await resolveAnswer('¿cómo publico?', [], { serverConfigured: true, ask: async () => ({ text: null, reason: 'limit' }) });
    expect(limit).toMatchObject({ source: 'faq', reason: 'limit' });
    const down = await resolveAnswer('¿cómo publico?', [], { serverConfigured: true, ask: async () => ({ text: null, reason: 'unavailable' }) });
    expect(down).toMatchObject({ source: 'faq', reason: 'unavailable' });
    const offline = await resolveAnswer('¿cómo publico?', [], {
      serverConfigured: true,
      ask: async () => {
        throw new Error('Network request failed');
      },
    });
    expect(offline).toMatchObject({ source: 'faq', reason: 'offline' });
  });
});
