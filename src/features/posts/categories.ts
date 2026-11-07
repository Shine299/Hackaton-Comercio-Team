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
];

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
