import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { kvStorage } from '@/shared/storage/kv';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** `true` solo si están las dos variables públicas. Sin ellas la app funciona con datos de demo. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Cliente con la clave pública (anon/publishable). Nunca la service role: la protección real es RLS.
 * La sesión anónima se guarda en el almacén local; no contiene datos personales.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: {
          getItem: (key) => kvStorage.getItem(key) as string | null,
          setItem: (key, value) => void kvStorage.setItem(key, value),
          removeItem: (key) => void kvStorage.removeItem(key),
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/** Devuelve el id del usuario anónimo, creando la sesión si hace falta. Lanza si no se puede. */
export async function ensureAnonymousUser(): Promise<string> {
  if (!supabase) throw new Error('Sin servidor configurado');
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) return data.session.user.id;
  const { data: created, error } = await supabase.auth.signInAnonymously();
  if (error || !created.user) throw new Error(error?.message ?? 'No se pudo iniciar sesión anónima');
  return created.user.id;
}

/**
 * Llama a una Edge Function con `fetch` directo (el mismo camino que sí funciona para el resto de Supabase en el APK;
 * `functions.invoke` fallaba antes de salir del teléfono). Lanza con el motivo real si no hay red o el servidor falla.
 */
export async function callFunction(name: string, body: BodyInit, contentType?: string): Promise<unknown> {
  if (!supabase || !url || !anonKey) throw new Error('Sin servidor configurado');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sin sesión');
  const headers: Record<string, string> = { apikey: anonKey, Authorization: `Bearer ${token}` };
  if (contentType) headers['Content-Type'] = contentType;
  let res: Response;
  try {
    res = await fetch(`${url}/functions/v1/${name}`, { method: 'POST', headers, body });
  } catch (e) {
    throw new Error(`sin conexión con ${name}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!res.ok) throw new Error(`${name} respondió ${res.status}`);
  return res.json().catch(() => null);
}
