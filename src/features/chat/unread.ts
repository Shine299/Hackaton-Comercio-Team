/** Lo mínimo de una conversación para saber si está sin leer. */
type UnreadInput = { id: string; lastAt: number; lastFromMe: boolean };

/**
 * Conversaciones sin leer (SPEC-048): el último mensaje es de la otra persona y es posterior a la última vez que abrí
 * el chat. Sin registro de lectura, se compara con `since` (cuando empezó a contarse), para no marcar lo viejo.
 */
export function unreadConversationIds(
  conversations: UnreadInput[],
  lastReadAt: Record<string, number>,
  since: number,
): string[] {
  return conversations
    .filter((c) => !c.lastFromMe && c.lastAt > 0 && c.lastAt > (lastReadAt[c.id] ?? since))
    .map((c) => c.id);
}

/**
 * Qué conversaciones sin leer son «nuevas» respecto de la foto anterior (id → hora del último mensaje): para notificar
 * solo una vez. La primera foto (al abrir la app) no notifica nada.
 */
export function freshUnread(previous: Record<string, number> | null, current: Record<string, number>): string[] {
  if (previous === null) return [];
  return Object.entries(current)
    .filter(([id, lastAt]) => previous[id] === undefined || lastAt > previous[id])
    .map(([id]) => id);
}
