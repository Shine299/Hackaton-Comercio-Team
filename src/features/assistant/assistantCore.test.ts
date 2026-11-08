import {
  buildProviderRequest,
  parseTranscription,
  transcriberFromEnv,
  transcriptionFields,
  parseProviderReply,
  providersFromEnv,
  runProviderChain,
  type ChatTurn,
} from '../../../supabase/functions/_shared/assistantCore';

// SPEC-049: cadena Mistral → Groq (lógica pura que usa la Edge Function).
const history: ChatTurn[] = [
  { role: 'user', text: '¿Cómo publico?' },
  { role: 'assistant', text: 'Ve a Ayuda.' },
  { role: 'user', text: '¿Y un evento?' },
];

describe('providersFromEnv', () => {
  it('ordena Mistral → Groq y salta los que no tienen clave', () => {
    const both = { MISTRAL_API_KEY: 'm', GROQ_API_KEY: 'g' };
    expect(providersFromEnv((k) => both[k as keyof typeof both]).map((p) => p.id)).toEqual(['mistral', 'groq']);
    const onlyGroq = { GROQ_API_KEY: 'g' };
    expect(providersFromEnv((k) => onlyGroq[k as keyof typeof onlyGroq]).map((p) => p.id)).toEqual(['groq']);
  });

  it('no usa Gemini aunque su clave esté configurada', () => {
    const env = { GEMINI_API_KEY: 'x' };
    expect(providersFromEnv((k) => env[k as keyof typeof env])).toEqual([]);
  });

  it('usa el modelo por defecto si no se configura otro', () => {
    const [mistral] = providersFromEnv((k) => (k === 'MISTRAL_API_KEY' ? 'm' : undefined));
    expect(mistral.model).toBe('mistral-small-latest');
  });
});

describe('buildProviderRequest', () => {
  it('Mistral y Groq: formato chat con instrucciones de sistema y clave en Bearer', () => {
    for (const id of ['mistral', 'groq'] as const) {
      const req = buildProviderRequest({ id, apiKey: 'k', model: 'x' }, history);
      expect(req.headers.Authorization).toBe('Bearer k');
      const body = JSON.parse(req.body);
      expect(body.model).toBe('x');
      expect(body.messages[0].role).toBe('system');
      expect(body.messages.slice(1).map((m: { role: string }) => m.role)).toEqual(['user', 'assistant', 'user']);
    }
    expect(buildProviderRequest({ id: 'mistral', apiKey: 'k', model: 'x' }, history).url).toBe(
      'https://api.mistral.ai/v1/chat/completions',
    );
    expect(buildProviderRequest({ id: 'groq', apiKey: 'k', model: 'x' }, history).url).toBe(
      'https://api.groq.com/openai/v1/chat/completions',
    );
  });
});

describe('parseProviderReply', () => {
  it('lee el texto de cada formato, o null si viene vacío', () => {
    expect(parseProviderReply('mistral', { choices: [{ message: { content: ' Hola ' } }] })).toBe('Hola');
    expect(parseProviderReply('groq', { choices: [{ message: { content: 'Hola' } }] })).toBe('Hola');
    expect(parseProviderReply('groq', { choices: [{ message: { content: '   ' } }] })).toBeNull();
    expect(parseProviderReply('mistral', { choices: [] })).toBeNull();
  });
});

describe('runProviderChain', () => {
  const providers = [
    { id: 'mistral' as const, apiKey: 'm', model: 'a' },
    { id: 'groq' as const, apiKey: 'g', model: 'b' },
  ];

  it('responde el primero que funciona y no llama a los demás', async () => {
    const calls: string[] = [];
    const result = await runProviderChain(providers, history, async (p) => {
      calls.push(p.id);
      return 'respuesta';
    });
    expect(result).toEqual({ text: 'respuesta', provider: 'mistral' });
    expect(calls).toEqual(['mistral']);
  });

  it('si Mistral falla o viene vacío, responde Groq', async () => {
    const failing = await runProviderChain(providers, history, async (p) => {
      if (p.id === 'mistral') throw new Error('429');
      return 'desde groq';
    });
    expect(failing).toEqual({ text: 'desde groq', provider: 'groq' });
    const empty = await runProviderChain(providers, history, async (p) => (p.id === 'mistral' ? null : 'desde groq'));
    expect(empty).toEqual({ text: 'desde groq', provider: 'groq' });
  });

  it('si todos fallan, devuelve null (el cliente usa las respuestas fijas)', async () => {
    expect(await runProviderChain(providers, history, async () => null)).toBeNull();
    expect(await runProviderChain([], history, async () => 'x')).toBeNull();
  });
});

describe('transcripción (SPEC-050)', () => {
  it('usa Groq Whisper si hay clave de Groq; si no, no hay transcripción', () => {
    expect(transcriberFromEnv((k) => (k === 'GROQ_API_KEY' ? 'g' : undefined))).toEqual({
      apiKey: 'g',
      model: 'whisper-large-v3-turbo',
      url: 'https://api.groq.com/openai/v1/audio/transcriptions',
    });
    expect(transcriberFromEnv(() => undefined)).toBeNull();
  });

  it('pide español y respuesta JSON', () => {
    expect(transcriptionFields('whisper-large-v3-turbo')).toEqual({
      model: 'whisper-large-v3-turbo',
      language: 'es',
      response_format: 'json',
    });
  });

  it('lee el texto transcrito, o null si viene vacío', () => {
    expect(parseTranscription({ text: ' hola vecino ' })).toBe('hola vecino');
    expect(parseTranscription({ text: '' })).toBeNull();
    expect(parseTranscription({})).toBeNull();
  });
});
