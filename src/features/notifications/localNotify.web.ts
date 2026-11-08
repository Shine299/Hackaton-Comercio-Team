/** En la vista previa web no hay notificaciones locales: no se hace nada. */
export const CHANNEL_ID = 'avisos-del-sector';

export async function ensurePermission(): Promise<boolean> {
  return false;
}

export async function notifyLocal(_content: { title: string; body: string; data: Record<string, string> }): Promise<void> {}
