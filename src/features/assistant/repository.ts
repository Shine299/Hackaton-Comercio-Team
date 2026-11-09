import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import { callFunction, ensureAnonymousUser, supabase } from '@/shared/supabase/client';

import type { AssistantTurn, ServerReply } from './logic';
import { audioMimeFromUri, buildAudioMultipart, fileFromMime } from './voice';

/**
 * Pregunta al asistente por la Edge Function `asistente` (SPEC-049). Necesita sesión (anónima vale) para el
 * límite por persona. Lanza error si no hay red o servidor: el cliente responde entonces con las respuestas fijas.
 */
export async function askAssistant(history: AssistantTurn[]): Promise<ServerReply> {
  if (!supabase) throw new Error('Sin servidor configurado');
  await ensureAnonymousUser();
  const data = await callFunction('asistente', JSON.stringify({ messages: history.slice(-10) }), 'application/json');
  const reply = data as { text?: unknown; provider?: unknown; reason?: unknown } | null;
  if (reply && typeof reply.text === 'string' && reply.text.trim()) {
    return { text: reply.text, provider: typeof reply.provider === 'string' ? reply.provider : 'ia' };
  }
  return { text: null, reason: reply?.reason === 'limit' ? 'limit' : 'unavailable' };
}

export type TranscriptionResult = { text: string } | { text: null; reason: 'limit' | 'unavailable' | 'empty' | 'format' };

/**
 * Voz a texto (SPEC-050): sube la grabación a la función `asistente`, que la pasa a Groq Whisper y la descarta.
 * Lanza error si no hay red o servidor.
 */
export async function transcribeAudio(uri: string): Promise<TranscriptionResult> {
  if (!supabase) throw new Error('Sin servidor configurado');
  await ensureAnonymousUser();
  const sent = await invokeWithAudio('asistente', uri);
  if (!sent) return { text: null, reason: 'format' };
  const reply = sent.data as { text?: unknown; reason?: unknown } | null;
  if (reply && typeof reply.text === 'string' && reply.text.trim()) return { text: reply.text };
  const reason = reply?.reason;
  return { text: null, reason: reason === 'limit' || reason === 'empty' ? reason : 'unavailable' };
}

/**
 * Agrega el audio al formulario. En el celular la grabación es un archivo local con extensión (React Native lo sube con
 * `{ uri, name, type }`); en el navegador (vista previa de desarrollo) es una dirección `blob:` sin extensión, así que se
 * descarga el blob y se sube con su tipo. `false` = formato que no se puede enviar.
 */
export async function appendAudio(form: FormData, uri: string): Promise<boolean> {
  if (uri.startsWith('blob:') || uri.startsWith('data:')) {
    const blob = await (await fetch(uri)).blob();
    const file = fileFromMime(blob.type);
    if (!file) return false;
    form.append('audio', blob, file.name);
    return true;
  }
  const file = audioMimeFromUri(uri);
  if (!file) return false;
  form.append('audio', { uri, name: file.name, type: file.type } as unknown as Blob);
  return true;
}

/**
 * Sube una grabación a una Edge Function. En el celular lee el archivo y manda los bytes (más fiable en el APK que el
 * `FormData` con `uri`); en el navegador usa el `FormData` de siempre. `null` = formato que no se puede enviar.
 */
export async function invokeWithAudio(fn: 'asistente' | 'guardia', uri: string): Promise<{ data: unknown } | null> {
  if (!supabase) throw new Error('Sin servidor configurado');
  if (Platform.OS === 'web') {
    const form = new FormData();
    if (!(await appendAudio(form, uri))) return null;
    return { data: await callFunction(fn, form) };
  }
  const file = audioMimeFromUri(uri);
  if (!file) return null;
  const bytes = await new File(uri).arrayBuffer();
  const { body, contentType } = buildAudioMultipart(bytes, file);
  return { data: await callFunction(fn, body, contentType) };
}
