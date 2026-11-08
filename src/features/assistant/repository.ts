import { ensureAnonymousUser, supabase } from '@/shared/supabase/client';

import type { AssistantTurn, ServerReply } from './logic';
import { audioMimeFromUri } from './voice';

/**
 * Pregunta al asistente por la Edge Function `asistente` (SPEC-049). Necesita sesión (anónima vale) para el
 * límite por persona. Lanza error si no hay red o servidor: el cliente responde entonces con las respuestas fijas.
 */
export async function askAssistant(history: AssistantTurn[]): Promise<ServerReply> {
  if (!supabase) throw new Error('Sin servidor configurado');
  await ensureAnonymousUser();
  const { data, error } = await supabase.functions.invoke('asistente', { body: { messages: history.slice(-10) } });
  if (error) throw new Error(error.message);
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
  const file = audioMimeFromUri(uri);
  if (!file) return { text: null, reason: 'format' };
  await ensureAnonymousUser();
  const form = new FormData();
  // React Native sube un archivo local con { uri, name, type }.
  form.append('audio', { uri, name: file.name, type: file.type } as unknown as Blob);
  const { data, error } = await supabase.functions.invoke('asistente', { body: form });
  if (error) throw new Error(error.message);
  const reply = data as { text?: unknown; reason?: unknown } | null;
  if (reply && typeof reply.text === 'string' && reply.text.trim()) return { text: reply.text };
  const reason = reply?.reason;
  return { text: null, reason: reason === 'limit' || reason === 'empty' ? reason : 'unavailable' };
}
