import type { Post } from '@/features/posts';
import type { IconName } from '@/shared/ui';

/**
 * Rubros de Emprendimientos. No hay columna nueva en el servidor: el rubro, el horario y la forma de
 * entrega viajan en `details` (jsonb) de la publicación, con estas etiquetas fijas.
 */
export const BUSINESS_RUBROS = [
  { id: 'bodega', label: 'Bodega', icon: 'storefront-outline' },
  { id: 'comida', label: 'Comida', icon: 'silverware-fork-knife' },
  { id: 'servicios', label: 'Servicios', icon: 'account-wrench-outline' },
  { id: 'costura', label: 'Costura', icon: 'needle' },
  { id: 'belleza', label: 'Belleza', icon: 'content-cut' },
  { id: 'mascotas', label: 'Mascotas', icon: 'paw' },
  { id: 'otro', label: 'Otro', icon: 'shape-outline' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type RubroId = (typeof BUSINESS_RUBROS)[number]['id'];

export const DETAIL_RUBRO = 'Rubro';
export const DETAIL_HOURS = 'Horario de atención';
export const DETAIL_DELIVERY = 'Cómo se entrega';

export const DELIVERY_PICKUP = 'Recojo en tienda';
export const DELIVERY_HOME = 'Delivery en el sector';

export function detailOf(post: Post, label: string): string | undefined {
  return post.details?.find((d) => d.label === label)?.value;
}

/** Rubro de un emprendimiento; si no lo declaró, «Otro». */
export function rubroOf(post: Post) {
  const label = detailOf(post, DETAIL_RUBRO);
  return BUSINESS_RUBROS.find((r) => r.label === label) ?? BUSINESS_RUBROS[BUSINESS_RUBROS.length - 1];
}

export function hasDelivery(post: Post): boolean {
  return (detailOf(post, DETAIL_DELIVERY) ?? '').toLowerCase().includes('delivery');
}
