import { supabase } from '@/shared/supabase/client';

import type { ChatMessage, Conversation, PendingRequest } from './types';

type ConversationRow = {
  id: string;
  post_id: string;
  post_title: string;
  other_name: string;
  last_body: string;
  last_at: string;
};
type RequestRow = {
  id: string;
  post_id: string;
  post_title: string;
  message: string;
  requester_name: string;
  created_at: string;
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
  }));
}

/** Solicitudes de contacto que recibí y debo aceptar o rechazar. */
export async function fetchPendingRequests(): Promise<PendingRequest[]> {
  if (!supabase) return [];
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return [];
  const { data, error } = await supabase.rpc('pending_requests');
  if (error || !data) return [];
  return (data as RequestRow[]).map((r) => ({
    id: r.id,
    postId: r.post_id,
    postTitle: r.post_title,
    message: r.message,
    requesterName: r.requester_name,
    createdAt: ms(r.created_at),
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

/** El dueño acepta: el servidor abre la conversación y devuelve su id. */
export async function acceptRequest(requestId: string): Promise<string> {
  if (!supabase) throw new Error('Sin servidor configurado');
  const { data, error } = await supabase.rpc('accept_request', { p_request_id: requestId });
  if (error || !data) throw new Error(error?.message ?? 'No se pudo aceptar la solicitud');
  return data as string;
}

export async function declineRequest(requestId: string): Promise<void> {
  if (!supabase) throw new Error('Sin servidor configurado');
  const { error } = await supabase.rpc('decline_request', { p_request_id: requestId });
  if (error) throw new Error(error.message);
}
