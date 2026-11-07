import type { OutboxItem } from './types';

export type SendResult = { ok: true; status: 'received' } | { ok: false; error: string };

/** Cómo sale un elemento de la cola. La etapa 10 registra aquí el transporte de Supabase. */
export type SyncTransport = {
  name: string;
  send: (item: OutboxItem) => Promise<SendResult>;
};

/** Sin servidor: nada se envía, y lo decimos con claridad en vez de simular un éxito. */
export const noServerTransport: SyncTransport = {
  name: 'sin-servidor',
  send: async () => ({ ok: false, error: 'Sin servidor configurado' }),
};

let active: SyncTransport = noServerTransport;

export const getTransport = () => active;
export const setTransport = (transport: SyncTransport) => {
  active = transport;
};
export const hasServerTransport = () => active !== noServerTransport;
