import type { SyncStatus } from '@/shared/sync/status';

/**
 * Contrato de acceso a publicaciones. Lo cumple un mock con datos de demo y una implementación Supabase,
 * sin tocar la UI.
 */
export interface PostsRepository {
  /** Publicaciones cercanas al sector indicado (incluye sectores contiguos con su distancia). */
  listNearby(sectorId: string): Promise<Post[]>;
  getById(id: string): Promise<Post | null>;
}

/** Ciclo de vida de una publicación (docs/02_ux_ui §6). */
export type PostStatus = 'draft' | 'active' | 'paused' | 'in_coordination' | 'completed' | 'closed' | 'expired';

export type PostKind = 'offer' | 'request';

export const POST_CATEGORY_IDS = [
  'tools',
  'services',
  'products',
  'barter',
  'mobility',
  'care',
  'business',
] as const;

export type PostCategoryId = (typeof POST_CATEGORY_IDS)[number];

/**
 * Señales de confianza comunitaria. «new» no es una penalización: la relevancia
 * evita invisibilizar a vecinos nuevos.
 */
export type TrustLevel = 'new' | 'verified' | 'endorsed';

export type PostAuthor = {
  id: string;
  /** Nombre corto público (nombre + inicial). Nunca datos de contacto. */
  displayName: string;
  trust: TrustLevel;
  recommendations: number;
};

/** Dato dinámico por categoría (duración del préstamo, condición, cupos…). */
export type PostDetail = { label: string; value: string };

export type Post = {
  id: string;
  kind: PostKind;
  category: PostCategoryId;
  title: string;
  description: string;
  author: PostAuthor;
  sectorId: string;
  /** Distancia aproximada al sector del vecino, en metros (se redondea al mostrarla). */
  distanceM: number;
  createdAt: number;
  expiresAt: number;
  status: PostStatus;
  /** Texto de precio/condición: «Gratis», «Préstamo», «S/ 40 la visita»… */
  priceLabel?: string;
  /** Necesidad urgente declarada por quien publica. NO equivale a validada. */
  urgent?: boolean;
  /** Disponible de inmediato (vs. a coordinar). */
  availableNow: boolean;
  /** Campos propios de la categoría. */
  details?: PostDetail[];
  /** Fotografía local o remota, si existe. */
  photoUri?: string;
  /** Publicación creada en este dispositivo. */
  isOwn?: boolean;
  /** Estado de sincronización (solo publicaciones propias). Nunca «recibido» sin servidor. */
  syncStatus?: SyncStatus;
  /** `true` para contenido ficticio que debe mostrarse con la etiqueta de demo. */
  isDemo: boolean;
};
