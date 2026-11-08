/**
 * Poses de Yunta (la mascota). Los archivos viven en `assets/images/yunta/<pose>.png`; para cambiar una
 * imagen basta con reemplazar el PNG con el mismo nombre (fondo transparente, ~512 px de alto).
 */
export const YUNTA_POSES = [
  'wave',
  'point',
  'curious',
  'shield',
  'lock',
  'phone',
  'thumbs-up',
  'map-pin',
  'celebrate',
  'assistant',
] as const;

export type YuntaPose = (typeof YUNTA_POSES)[number];

/** Descripción para lectores de pantalla de lo que hace Yunta en cada pose. */
export const YUNTA_POSE_LABELS: Record<YuntaPose, string> = {
  wave: 'Yunta te saluda con la mano',
  point: 'Yunta te señala hacia arriba',
  curious: 'Yunta piensa con curiosidad',
  shield: 'Yunta te protege con un escudo',
  lock: 'Yunta cuida tu privacidad con un candado',
  phone: 'Yunta sostiene un celular con poca señal',
  'thumbs-up': 'Yunta te muestra el pulgar arriba',
  'map-pin': 'Yunta sostiene un marcador de ubicación',
  celebrate: 'Yunta celebra con los brazos arriba',
  assistant: 'Yunta te ofrece una burbuja de chat',
};

export function isYuntaPose(value: unknown): value is YuntaPose {
  return typeof value === 'string' && (YUNTA_POSES as readonly string[]).includes(value);
}

/** Si la pose no existe, usa el saludo: la pantalla nunca se queda sin Yunta. */
export function resolvePose(value: unknown): YuntaPose {
  return isYuntaPose(value) ? value : 'wave';
}
