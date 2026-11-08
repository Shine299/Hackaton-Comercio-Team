// Edge Function «asistente» (SPEC-049 y SPEC-050). Runtime: Deno (Supabase Edge Functions).
// - JSON `{ messages }`: conversación (ya sin datos personales: el teléfono los oculta antes) → cadena gratuita
//   Mistral → Groq.
// - `multipart/form-data` con `audio`: voz a texto con Groq Whisper (plan gratuito).
// Aplica el mismo límite diario. No guarda mensajes ni audio. Las claves viven solo como secretos de Supabase.
import {
  buildProviderRequest,
  type ChatTurn,
  parseProviderReply,
  parseTranscription,
  type ProviderConfig,
  providersFromEnv,
  runProviderChain,
  transcriberFromEnv,
  transcriptionFields,
} from '../_shared/assistantCore.ts';

const DAILY_PER_USER = 20;
const DAILY_GLOBAL = 400;
const PROVIDER_TIMEOUT_MS = 12_000;
const MAX_TURNS = 10;
const MAX_TEXT = 500;
const MAX_AUDIO_BYTES = 3 * 1024 * 1024;
const TRANSCRIBE_TIMEOUT_MS = 20_000;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/** El gateway de Supabase ya verificó la firma del JWT (verify_jwt): aquí solo se lee quién es. */
function userIdFromAuth(header: string | null): string | null {
  const token = header?.replace(/^Bearer\s+/i, '');
  const payload = token?.split('.')[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const data = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    return typeof data.sub === 'string' ? data.sub : null; // la clave anónima no tiene `sub`: hace falta sesión
  } catch {
    return null;
  }
}

function readHistory(body: unknown): ChatTurn[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const turns: ChatTurn[] = [];
  for (const item of raw.slice(-MAX_TURNS)) {
    const role = (item as { role?: unknown })?.role;
    const text = (item as { text?: unknown })?.text;
    if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string') return null;
    const clean = text.trim().slice(0, MAX_TEXT);
    if (clean) turns.push({ role, text: clean });
  }
  // La conversación debe empezar y terminar con la persona.
  while (turns.length > 0 && turns[0].role !== 'user') turns.shift();
  return turns.length > 0 && turns[turns.length - 1].role === 'user' ? turns : null;
}

async function allowed(userId: string): Promise<boolean> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return false;
  const res = await fetch(`${url}/rest/v1/rpc/bump_assistant_usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({ p_user: userId, p_daily: DAILY_PER_USER, p_global: DAILY_GLOBAL }),
  });
  if (!res.ok) return false;
  return (await res.json()) === true;
}

async function callProvider(provider: ProviderConfig, history: ChatTurn[]): Promise<string | null> {
  const req = buildProviderRequest(provider, history);
  const res = await fetch(req.url, {
    method: 'POST',
    headers: req.headers,
    body: req.body,
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });
  if (!res.ok) {
    // Sin el texto del error: puede traer detalles de la cuenta. Solo el estado, para depurar.
    console.warn(`asistente: ${provider.id} respondió ${res.status}`);
    return null;
  }
  return parseProviderReply(provider.id, await res.json());
}

/** Voz a texto (SPEC-050). El audio se reenvía a Groq y se descarta: no se guarda en ningún lado. */
async function transcribe(req: Request, userId: string): Promise<Response> {
  const form = await req.formData().catch(() => null);
  const audio = form?.get('audio');
  if (!(audio instanceof File) || audio.size === 0) return json({ error: 'invalid_audio' }, 400);
  if (audio.size > MAX_AUDIO_BYTES) return json({ error: 'audio_too_large' }, 413);

  const transcriber = transcriberFromEnv((name) => Deno.env.get(name));
  if (!transcriber) return json({ text: null, reason: 'unavailable' });
  if (!(await allowed(userId))) return json({ text: null, reason: 'limit' });

  const upstream = new FormData();
  for (const [key, value] of Object.entries(transcriptionFields(transcriber.model))) upstream.append(key, value);
  upstream.append('file', audio, audio.name || 'voz.m4a');

  try {
    const res = await fetch(transcriber.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${transcriber.apiKey}` },
      body: upstream,
      signal: AbortSignal.timeout(TRANSCRIBE_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`asistente: transcripción respondió ${res.status}`);
      return json({ text: null, reason: 'unavailable' });
    }
    const text = parseTranscription(await res.json());
    return json(text ? { text } : { text: null, reason: 'empty' });
  } catch {
    return json({ text: null, reason: 'unavailable' });
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const userId = userIdFromAuth(req.headers.get('Authorization'));
  if (!userId) return json({ error: 'session_required' }, 401);

  if ((req.headers.get('Content-Type') ?? '').includes('multipart/form-data')) return transcribe(req, userId);

  const history = readHistory(await req.json().catch(() => null));
  if (!history) return json({ error: 'invalid_messages' }, 400);

  if (!(await allowed(userId))) return json({ text: null, reason: 'limit' });

  const providers = providersFromEnv((name) => Deno.env.get(name));
  const result = await runProviderChain(providers, history, callProvider);
  if (!result) return json({ text: null, reason: 'unavailable' });
  return json({ text: result.text, provider: result.provider });
});
