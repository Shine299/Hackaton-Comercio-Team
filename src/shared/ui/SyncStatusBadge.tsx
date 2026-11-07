import { SYNC_STATUS_LABEL, type SyncStatus } from '@/shared/sync/status';

import { Badge, type BadgeTone } from './Badge';
import type { IconName } from './Icon';

const config: Record<SyncStatus, { tone: BadgeTone; icon: IconName }> = {
  local: { tone: 'warning', icon: 'cellphone-check' },
  pending: { tone: 'warning', icon: 'clock-outline' },
  sending: { tone: 'primary', icon: 'cloud-upload-outline' },
  received: { tone: 'primary', icon: 'cloud-check-outline' },
  in_review: { tone: 'secondary', icon: 'eye-outline' },
  validated: { tone: 'success', icon: 'check-decagram-outline' },
  resolved: { tone: 'success', icon: 'check-circle-outline' },
};

/** Estado de sincronización siempre visible: icono + texto, nunca solo color. */
export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const c = config[status];
  return <Badge label={SYNC_STATUS_LABEL[status]} tone={c.tone} icon={c.icon} />;
}
