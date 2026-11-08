import type { IconName } from '@/shared/ui';

import type { PostCategoryId, PostKind, TrustLevel } from './types';

type CategoryInfo = { id: PostCategoryId; label: string; icon: IconName };

export const POST_CATEGORIES: CategoryInfo[] = [
  { id: 'tools', label: 'Herramientas', icon: 'hammer-wrench' },
  { id: 'services', label: 'Servicios y oficios', icon: 'account-wrench-outline' },
  { id: 'products', label: 'Objetos y productos', icon: 'package-variant-closed' },
  { id: 'barter', label: 'Trueque', icon: 'swap-horizontal' },
  { id: 'mobility', label: 'Movilidad', icon: 'car-outline' },
  { id: 'care', label: 'Cuidado y apoyo', icon: 'hand-heart-outline' },
  { id: 'pets', label: 'Animales y mascotas', icon: 'paw' },
  { id: 'business', label: 'Negocios', icon: 'storefront-outline' },
];

/**
 * Categorías de «ayuda entre vecinos» (Explorar y Publicar). Emprendimientos NO está aquí:
 * tiene su propia sección (pestaña Negocios) y su propio registro.
 */
export const HELP_CATEGORIES: CategoryInfo[] = POST_CATEGORIES.filter((c) => c.id !== 'business');

/**
 * Ayuda se separa en dos mundos para no mezclarlos: objetos y favores (prestar, arreglar, trueque…)
 * y animales (mascotas perdidas, cuidado, adopción).
 */
export type HelpGroup = 'all' | 'objects' | 'animals';

export const HELP_GROUPS: { id: HelpGroup; label: string; icon: IconName }[] = [
  { id: 'all', label: 'Todo', icon: 'apps' },
  { id: 'objects', label: 'Objetos y favores', icon: 'package-variant-closed' },
  { id: 'animals', label: 'Animales', icon: 'paw' },
];

export const helpGroupOf = (id: PostCategoryId): Exclude<HelpGroup, 'all'> => (id === 'pets' ? 'animals' : 'objects');

/** Categorías de ayuda que pertenecen a un grupo («Todo» = todas las de ayuda). */
export const categoriesOfGroup = (group: HelpGroup): CategoryInfo[] =>
  group === 'all' ? HELP_CATEGORIES : HELP_CATEGORIES.filter((c) => helpGroupOf(c.id) === group);

const byId = Object.fromEntries(POST_CATEGORIES.map((c) => [c.id, c])) as Record<
  PostCategoryId,
  CategoryInfo
>;

export const getCategory = (id: PostCategoryId): CategoryInfo => byId[id];

export const POST_KIND_LABEL: Record<PostKind, string> = {
  offer: 'Ofrece',
  request: 'Solicita',
};

export const TRUST_LABEL: Record<TrustLevel, string> = {
  new: 'Nuevo en la red',
  verified: 'Vecino verificado',
  endorsed: 'Aval de la comunidad',
};
