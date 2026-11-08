import { ensureAnonymousUser, supabase } from '@/shared/supabase/client';

import type { ChatMessage, Conversation } from './types';

type ConversationRow = {
  id: string;
  post_id: string;
  post_title: string;
  other_name: string;
  last_body: string;
  last_at: string;
  blocked: boolean | null;
  /** Desde la migración 10 (SPEC-048). Si aún no existe, se asume «mío» para no contar ni notificar de más. */
  last_from_me?: boolean | null;
};
type MessageRow = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string };

const ms = (iso: string) => new Date(iso).getTime();

/** Mis conversaciones (RLS: solo donde participo). Sin servidor o sin sesión: lista vacía. */
export async function fetchConversations(): Promise<Conversation[]> {
  if (!supabase) return [];
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return [];
  const { data, error } = await supabase.rpc('my_conversations');
  if (error || !data) return [];
  return (data as ConversationRow[]).map((r) => ({
    id: r.id,
    postId: r.post_id,
    postTitle: r.post_title,
    otherName: r.other_name,
    lastBody: r.last_body,
    lastAt: ms(r.last_at),
    isDemo: false,
    blocked: r.blocked === true,
    lastFromMe: r.last_from_me !== false,
  }));
}

/** Mensajes de una conversación (RLS: solo si participo). `mine` se calcula con mi id de usuario. */
export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const { data: session } = await supabase.auth.getSession();
  const me = session.session?.user.id;
  if (!me) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('id,conversation_id,sender_id,body,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(300)
    .overrideTypes<MessageRow[]>();
  if (error || !data) throw new Error(error?.message ?? 'No se pudieron cargar los mensajes');
  return data.map((r) => ({
    id: r.id,
    conversationId: r.conversation_id,
    body: r.body,
    createdAt: ms(r.created_at),
    mine: r.sender_id === me,
  }));
}

/**
 * SPEC-045: abre (o reutiliza) la conversación con el dueño de una publicación. Antes se asegura de que exista tu
 * perfil público, para que la otra persona vea tu nombre y no «Vecino».
 */
export async function startConversation(postId: string, displayName: string): Promise<string> {
  if (!supabase) throw new Error('Sin servidor configurado');
  await ensureAnonymousUser();
  const profile = await supabase.rpc('upsert_profile', { p_display_name: displayName || 'Vecino' });
  if (profile.error) throw new Error(profile.error.message);
  const { data, error } = await supabase.rpc('start_conversation', { p_post_id: postId });
  if (error || !data) throw new Error(error?.message ?? 'No se pudo abrir la conversación');
  return data as string;
}
