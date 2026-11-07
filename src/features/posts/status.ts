import type { PostStatus } from './types';

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  draft: 'Borrador',
  active: 'Activa',
  paused: 'Pausada',
  in_coordination: 'En coordinación',
  completed: 'Completada',
  closed: 'Cerrada',
  expired: 'Vencida',
};
