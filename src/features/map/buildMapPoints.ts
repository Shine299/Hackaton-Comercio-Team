import { describeSharedItem, type BoardItem, type SharedBoardItem } from '@/features/emergency';
import { POST_KIND_LABEL, type Post } from '@/features/posts';
import type { Sector } from '@/features/sector';

import { approxPoint } from './approx';
import { getPlacePoints, getShopPoints } from './places';
import type { MapLayerId, MapPoint } from './types';

const SOURCE_DEMO = 'Dato de demostración (ficticio)';

/** Voluntarios y zonas afectadas FICTICIOS. No describen a nadie ni hechos reales. */
const DEMO_VOLUNTEERS = [
  { id: 'demo-vol-1', title: 'Voluntario/a de demo', detail: 'Disponible: herramientas y arreglos menores.' },
  { id: 'demo-vol-2', title: 'Voluntario/a de demo', detail: 'Disponible: acompañamiento y recados cercanos.' },
  { id: 'demo-vol-3', title: 'Voluntario/a de demo', detail: 'Disponible: movilidad (traslados cortos).' },
];

const DEMO_ZONES = [
  { id: 'demo-zone-1', title: 'Calle anegada (simulada)', detail: 'Zona afectada de demostración.', radiusM: 260 },
  { id: 'demo-zone-2', title: 'Corte de agua (simulado)', detail: 'Zona afectada de demostración.', radiusM: 380 },
];

const BOARD_LAYER: Record<BoardItem['section'], MapLayerId> = {
  incident: 'incidents',
  need: 'needs',
  vulnerable: 'needs', // la vulnerabilidad reportada se ve como necesidad, sin identificar a nadie
  resource: 'resources',
};

type Input = {
  sector: Sector;
  posts: Post[];
  board: BoardItem[];
  /** Avisos reales de vecinos (tablero compartido). */
  shared?: SharedBoardItem[];
  volunteer: { available: boolean; showSector: boolean };
  /** Cámaras vecinales del sector (solo zona aproximada). */
  cameras?: { id: string; name: string; placeLabel: string; active: boolean; isDemo: boolean }[];
};

/**
 * Convierte lo que ya existe en la app (publicaciones, tablero, perfil) en puntos de mapa.
 * Todos los puntos usan una zona aproximada derivada del centro del sector.
 */
export function buildMapPoints({ sector, posts, board, shared = [], volunteer, cameras = [] }: Input): MapPoint[] {
  const center = sector.center;
  const points: MapPoint[] = [];

  for (const item of board) {
    const layer = BOARD_LAYER[item.section];
    points.push({
      id: `board:${item.id}`,
      layer,
      title: item.title,
      detail: item.section === 'vulnerable' ? `No validada · ${item.validation}` : item.validation,
      coord: approxPoint(center, item.id, item.section === 'vulnerable' ? 0.3 : 0.15),
      isDemo: item.isDemo,
      source: item.source,
      target: item.reportId ? { kind: 'report', id: item.reportId } : { kind: 'board' },
    });
  }

  for (const item of shared) {
    if (item.status === 'resolved') continue;
    const { title } = describeSharedItem(item, sector.name);
    const priority = item.source === 'vulnerable' || item.immediateDanger;
    const crowd =
      item.responders > 0
        ? `${item.responders === 1 ? '1 vecino va' : `${item.responders} vecinos van`} en camino`
        : 'Nadie ha respondido todavía';
    points.push({
      id: `shared:${item.id}`,
      layer: item.source === 'incident' ? 'incidents' : 'needs',
      title,
      detail: priority ? `No validada · ${crowd}` : crowd,
      coord: approxPoint(center, item.id, 0.25, 0.7),
      isDemo: false,
      source: item.mine ? 'Tu aviso (en vivo)' : 'Un vecino de tu sector (en vivo)',
      target: { kind: 'shared', id: item.id },
    });
  }

  for (const post of posts) {
    const isBusiness = post.category === 'business';
    points.push({
      id: `post:${post.id}`,
      layer: isBusiness ? 'business' : 'posts',
      title: post.title,
      detail: isBusiness
        ? [post.priceLabel, post.availableNow ? 'Disponible ahora' : undefined].filter(Boolean).join(' · ') ||
          POST_KIND_LABEL[post.kind]
        : POST_KIND_LABEL[post.kind],
      coord: approxPoint(center, post.id),
      isDemo: post.isDemo,
      source: post.isDemo ? SOURCE_DEMO : 'Publicación hecha en este teléfono',
      target: { kind: 'post', id: post.id },
    });
  }

  for (const v of DEMO_VOLUNTEERS) {
    points.push({ id: v.id, layer: 'volunteers', title: v.title, detail: v.detail, coord: approxPoint(center, v.id), isDemo: true, source: SOURCE_DEMO, target: { kind: 'none' } });
  }
  if (volunteer.available && volunteer.showSector) {
    points.push({ id: 'volunteer-me', layer: 'volunteers', title: 'Tú · voluntario/a disponible', detail: 'Visible solo como zona aproximada de tu sector.', coord: approxPoint(center, 'volunteer-me'), isDemo: false, source: 'Tu perfil en este teléfono', target: { kind: 'none' } });
  }

  for (const z of DEMO_ZONES) {
    points.push({ id: z.id, layer: 'zones', title: z.title, detail: z.detail, coord: approxPoint(center, z.id, 0.2, 0.7), radiusM: z.radiusM, isDemo: true, source: SOURCE_DEMO, target: { kind: 'none' } });
  }

  for (const cam of cameras) {
    points.push({
      id: `camera:${cam.id}`,
      layer: 'cameras',
      title: cam.name,
      detail: `${cam.placeLabel} · ${cam.active ? 'En vivo' : 'Sin señal'}`,
      coord: approxPoint(center, cam.id, 0.2, 0.6),
      isDemo: cam.isDemo,
      source: cam.isDemo ? SOURCE_DEMO : 'Cámara vecinal registrada en este teléfono',
      target: { kind: 'camera', id: cam.id },
    });
  }

  points.push(...getPlacePoints(center, sector.radiusKm));
  points.push(...getShopPoints(center, sector.radiusKm));

  return points;
}
