// Edge Function «guardia» (SPEC-052, Modo guardia por voz). Runtime: Deno (Supabase Edge Functions).
// Solo voz a texto: recibe un clip corto (`multipart/form-data` con `audio`) y lo pasa a Groq Whisper (plan gratuito).
// No guarda audio ni texto: solo cuenta cuántos clips hubo por persona y día (`guard_usage`), con su propio tope para no
// agotar el cupo del asistente. Las claves viven solo como secretos de Supabase. La emergencia no pasa por ninguna IA.
import { parseTranscription, transcriberFromEnv, transcriptionFields } from '../_shared/assistantCore.ts';

// Topes iniciales. Hay que revisarlos antes de desplegar: Groq da ~2.000 pedidos al día en total y el asistente comparte ese cupo.
const DAILY_PER_USER = 200;
const DAILY_GLOBAL = 1000;
const MAX_AUDIO_BYTES = 1024 * 1024; // un clip de ~4 s pesa ~16 KB: 1 MB es de sobra
const TRANSCRIBE_TIMEOUT_MS = 15_000;
// Sesga a Whisper para que escriba «Yunta» y las frases de ayuda tal cual.
const PROMPT = 'Hola Yunta, ayúdame, me pasó algo. Sí. No, estoy bien.';

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

async function allowed(userId: string): Promise<boolean> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return false;
  const res = await fetch(`${url}/rest/v1/rpc/bump_guard_usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({ p_user: userId, p_daily: DAILY_PER_USER, p_global: DAILY_GLOBAL }),
  });
  if (!res.ok) return false;
  return (await res.json()) === true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const userId = userIdFromAuth(req.headers.get('Authorization'));
  if (!userId) return json({ error: 'session_required' }, 401);

  const form = await req.formData().catch(() => null);
  const audio = form?.get('audio');
  if (!(audio instanceof File) || audio.size === 0) return json({ error: 'invalid_audio' }, 400);
  if (audio.size > MAX_AUDIO_BYTES) return json({ error: 'audio_too_large' }, 413);

  const transcriber = transcriberFromEnv((name) => Deno.env.get(name));
  if (!transcriber) return json({ text: null, reason: 'unavailable' });
  if (!(await allowed(userId))) return json({ text: null, reason: 'limit' });

  const upstream = new FormData();
  for (const [key, value] of Object.entries(transcriptionFields(transcriber.model))) upstream.append(key, value);
  upstream.set('prompt', PROMPT);
  upstream.append('file', audio, audio.name || 'voz.m4a');

  try {
    const res = await fetch(transcriber.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${transcriber.apiKey}` },
      body: upstream,
      signal: AbortSignal.timeout(TRANSCRIBE_TIMEOUT_MS),
    });
    if (!res.ok) {
      // Sin el texto del error: puede traer detalles de la cuenta. Solo el estado, para depurar.
      console.warn(`guardia: transcripción respondió ${res.status}`);
      return json({ text: null, reason: 'unavailable' });
    }
    const text = parseTranscription(await res.json());
    return json(text ? { text } : { text: null, reason: 'empty' });
  } catch {
    return json({ text: null, reason: 'unavailable' });
  }
});
