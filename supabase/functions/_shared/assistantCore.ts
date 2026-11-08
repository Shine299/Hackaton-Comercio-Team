/**
 * Núcleo del asistente de Yunta (SPEC-049). Código puro, sin Deno: lo usa la Edge Function `asistente` y lo prueban
 * Jest y `tsc` desde `src/features/assistant/assistantCore.test.ts`.
 *
 * Cadena de proveedores gratuitos: Mistral (principal) → Groq. Ambos usan el formato de chat compatible con OpenAI.
 * Si los dos fallan, la función responde que no hay IA disponible y el cliente usa sus respuestas fijas.
 */

export type ProviderId = 'mistral' | 'groq';
export type ProviderConfig = { id: ProviderId; apiKey: string; model: string };
export type ChatTurn = { role: 'user' | 'assistant'; text: string };
export type ProviderRequest = { url: string; headers: Record<string, string>; body: string };

/** Respuestas cortas: alcanzan para el asistente y cuidan el cupo gratuito. */
const MAX_OUTPUT_TOKENS = 400;

export const SYSTEM_PROMPT = [
  'Eres el asistente de Yunta, una app que ayuda a vecinos de Lima a ayudarse entre sí.',
  'Responde en español de Perú, breve (máximo 4 frases), claro y cálido.',
  'Solo hablas de Yunta y de la vida en el barrio. Si te preguntan otra cosa, dilo con amabilidad y vuelve al tema.',
  'Yunta tiene: Inicio (novedades del barrio), Eventos (crear eventos y marcar «Voy»), Explorar (lugares y',
  'emprendimientos; «Abierto ahora» solo si hay horario confirmado), Ayuda (ofrecer, pedir, prestar o vender;',
  '«Escribir» abre un chat con quien publicó), Chat (mensajes con vecinos, se puede bloquear y reportar) y el botón SOS',
  '(Emergencia: reportar o pedir auxilio sin cuenta).',
  'Nunca des consejos médicos, legales ni financieros. Ante cualquier emergencia, di que use el botón SOS y llame al 105',
  '(Policía), al 116 (Bomberos) o al 106 (SAMU); Yunta no reemplaza a los servicios oficiales.',
  'No pidas ni repitas datos personales (teléfono, dirección exacta, documentos). Si no sabes algo, dilo.',
  'No inventes funciones que Yunta no tiene.',
].join(' ');

const DEFAULT_MODEL: Record<ProviderId, string> = {
  mistral: 'mistral-small-latest',
  groq: 'llama-3.3-70b-versatile',
};

/** Orden fijo de la cadena. Un proveedor sin clave se salta. */
export function providersFromEnv(get: (name: string) => string | undefined): ProviderConfig[] {
  const order: ProviderId[] = ['mistral', 'groq'];
  return order.flatMap((id) => {
    const prefix = id.toUpperCase();
    const apiKey = get(`${prefix}_API_KEY`)?.trim();
    if (!apiKey) return [];
    return [{ id, apiKey, model: get(`${prefix}_MODEL`)?.trim() || DEFAULT_MODEL[id] }];
  });
}

const CHAT_URL: Record<ProviderId, string> = {
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
};

export function buildProviderRequest(provider: ProviderConfig, history: ChatTurn[]): ProviderRequest {
  return {
    url: CHAT_URL[provider.id],
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history.map((t) => ({ role: t.role, content: t.text }))],
    }),
  };
}

type Json = Record<string, unknown>;
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asObject = (v: unknown): Json => (v && typeof v === 'object' ? (v as Json) : {});

/**
 * Texto de la respuesta (formato de chat compatible con OpenAI, igual en Mistral y Groq); `null` si no hay texto
 * utilizable. Recibe `_id` para registrar quién respondió y por si un proveedor futuro usa otro formato.
 */
export function parseProviderReply(_id: ProviderId, json: unknown): string | null {
  const message = asObject(asObject(asArray(asObject(json).choices)[0]).message);
  const text = typeof message.content === 'string' ? message.content : '';
  const trimmed = text.trim();
  return trimmed ? trimmed : null;
}

/**
 * Recorre la cadena: devuelve la primera respuesta con texto. `call` hace la llamada real (inyectada para probar) y
 * puede lanzar error o devolver `null`; en ambos casos se prueba el siguiente proveedor.
 */
export async function runProviderChain(
  providers: ProviderConfig[],
  history: ChatTurn[],
  call: (provider: ProviderConfig, history: ChatTurn[]) => Promise<string | null>,
): Promise<{ text: string; provider: ProviderId } | null> {
  for (const provider of providers) {
    try {
      const text = await call(provider, history);
      if (text) return { text, provider: provider.id };
    } catch {
      // Error, tiempo agotado o cupo agotado: siguiente proveedor.
    }
  }
  return null;
}

/* ---------- Voz a texto (SPEC-050): Groq Whisper, plan gratuito ---------- */

export type TranscriberConfig = { apiKey: string; model: string; url: string };

/** Solo Groq transcribe (Whisper). Sin clave de Groq no hay voz a texto. */
export function transcriberFromEnv(get: (name: string) => string | undefined): TranscriberConfig | null {
  const apiKey = get('GROQ_API_KEY')?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    model: get('GROQ_STT_MODEL')?.trim() || 'whisper-large-v3-turbo',
    url: 'https://api.groq.com/openai/v1/audio/transcriptions',
  };
}

/** Campos de texto del formulario (el archivo va aparte, en el campo `file`). */
export function transcriptionFields(model: string): Record<string, string> {
  return { model, language: 'es', response_format: 'json' };
}

export function parseTranscription(json: unknown): string | null {
  const text = asObject(json).text;
  const trimmed = typeof text === 'string' ? text.trim() : '';
  return trimmed ? trimmed : null;
}
