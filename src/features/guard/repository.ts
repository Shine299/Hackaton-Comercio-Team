import { appendAudio } from '@/features/assistant';
import { ensureAnonymousUser, supabase } from '@/shared/supabase/client';

export type ClipTranscription = { text: string } | { text: null; reason: 'limit' | 'unavailable' | 'empty' | 'format' };

/**
 * Voz a texto del Modo guardia (SPEC-052): sube un clip con sonido a la función `guardia`, que lo pasa a Groq Whisper y
 * lo descarta (no guarda audio ni texto; solo cuenta usos por día). Lanza error si no hay red o servidor.
 */
export async function transcribeClip(uri: string): Promise<ClipTranscription> {
  if (!supabase) throw new Error('Sin servidor configurado');
  await ensureAnonymousUser();
  const form = new FormData();
  if (!(await appendAudio(form, uri))) return { text: null, reason: 'format' };
  const { data, error } = await supabase.functions.invoke('guardia', { body: form });
  if (error) throw new Error(error.message);
  const reply = data as { text?: unknown; reason?: unknown } | null;
  if (reply && typeof reply.text === 'string' && reply.text.trim()) return { text: reply.text };
  const reason = reply?.reason;
  return { text: null, reason: reason === 'limit' || reason === 'empty' ? reason : 'unavailable' };
}
