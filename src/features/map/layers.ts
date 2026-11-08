import { colors } from '@/shared/ui';

import type { MapLayerId, MapLayerMeta } from './types';

export const MAP_LAYERS: MapLayerMeta[] = [
  { id: 'incidents', label: 'Incidentes', icon: 'alert-octagon-outline', color: colors.error, defaultOn: true },
  { id: 'needs', label: 'Necesidades', icon: 'hand-extended-outline', color: colors.secondary, defaultOn: true },
  { id: 'resources', label: 'Recursos', icon: 'package-variant', color: colors.primary, defaultOn: true },
  { id: 'volunteers', label: 'Voluntarios', icon: 'hand-heart-outline', color: colors.success, defaultOn: false },
  { id: 'zones', label: 'Zonas afectadas', icon: 'map-marker-radius-outline', color: colors.warning, defaultOn: false },
  { id: 'business', label: 'Negocios', icon: 'storefront-outline', color: '#b45f06', defaultOn: true },
  { id: 'posts', label: 'Publicaciones', icon: 'tag-outline', color: colors.primaryContainer, defaultOn: true },
  { id: 'places', label: 'Lugares de referencia', icon: 'town-hall', color: colors.tertiary, defaultOn: false },
  { id: 'cameras', label: 'Cámaras vecinales', icon: 'cctv', color: '#1f6466', defaultOn: true },
];

export const DEFAULT_LAYERS: MapLayerId[] = MAP_LAYERS.filter((l) => l.defaultOn).map((l) => l.id);

export function getLayer(id: MapLayerId): MapLayerMeta {
  return MAP_LAYERS.find((l) => l.id === id) ?? MAP_LAYERS[0];
}
