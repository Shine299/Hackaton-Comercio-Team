import { SECTORS } from '@/features/sector/data';
import { distanceKm } from '@/shared/geo/distance';
import { supabase } from '@/shared/supabase/client';

import type { PostsRepository } from './repository';
import type { Post, PostCategoryId, PostDetail, PostKind, PostStatus, TrustLevel } from './types';

type Row = {
  id: string;
  kind: PostKind;
  category: PostCategoryId;
  title: string;
  description: string;
  sector_id: string;
  price_label: string | null;
  urgent: boolean;
  available_now: boolean;
  details: PostDetail[] | null;
  status: PostStatus;
  is_demo: boolean;
  created_at: string;
  expires_at: string;
  profiles: { id: string; display_name: string; trust: TrustLevel; recommendations: number } | null;
};

const SELECT =
  'id,kind,category,title,description,sector_id,price_label,urgent,available_now,details,status,is_demo,created_at,expires_at,profiles!posts_author_id_fkey(id,display_name,trust,recommendations)';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sectorDistanceM(from: string, to: string): number {
  if (from === to) return 0;
  const a = SECTORS.find((s) => s.id === from);
  const b = SECTORS.find((s) => s.id === to);
  if (!a || !b) return 0;
  return Math.round(distanceKm(a.center, b.center) * 1000);
}

function toPost(row: Row, fromSector: string): Post {
  return {
    id: row.id,
    kind: row.kind,
    category: row.category,
    title: row.title,
    description: row.description,
    author: {
      id: row.profiles?.id ?? 'unknown',
      displayName: row.profiles?.display_name ?? 'Vecino',
      trust: row.profiles?.trust ?? 'new',
      recommendations: row.profiles?.recommendations ?? 0,
    },
    sectorId: row.sector_id,
    distanceM: sectorDistanceM(fromSector, row.sector_id),
    createdAt: new Date(row.created_at).getTime(),
    expiresAt: new Date(row.expires_at).getTime(),
    status: row.status,
    priceLabel: row.price_label ?? undefined,
    urgent: row.urgent || undefined,
    availableNow: row.available_now,
    details: row.details?.length ? row.details : undefined,
    isDemo: row.is_demo,
  };
}

/**
 * Publicaciones desde Supabase (RLS: solo activas y vigentes, sin ubicación precisa).
 * Si el servidor no responde, cae al repositorio de respaldo para que la app siga usable sin conexión.
 */
export function createSupabasePostsRepository(fallback: PostsRepository): PostsRepository {
  return {
    async listNearby(sectorId) {
      if (!supabase) return fallback.listNearby(sectorId);
      const { data, error } = await supabase
        .from('posts')
        .select(SELECT)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100)
        .overrideTypes<Row[]>();
      if (error || !data) return fallback.listNearby(sectorId);
      return data.map((row) => toPost(row, sectorId));
    },
    async getById(id) {
      if (!supabase || !UUID.test(id)) return fallback.getById(id);
      const { data, error } = await supabase
        .from('posts')
        .select(SELECT)
        .eq('id', id)
        .maybeSingle()
        .overrideTypes<Row>();
      if (error || !data) return null;
      return toPost(data, data.sector_id);
    },
  };
}
