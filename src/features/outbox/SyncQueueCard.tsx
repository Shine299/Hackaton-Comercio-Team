import { useNetworkState } from 'expo-network';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { formatRelativeTime } from '@/shared/format';
import { Badge, Button, Card, Icon, SyncStatusBadge, Text, type BadgeTone } from '@/shared/ui';

import { findPossibleDuplicates } from './duplicates';
import { hasServerTransport } from './transport';
import { isQueuePersistent, sortOutgoing, useOutboxStore, type FlushResult } from './store';
import { OUTBOX_TYPE_LABEL, PRIORITY_LABEL, type OutboxItem, type OutboxPriority } from './types';

const PRIORITY_TONE: Record<OutboxPriority, BadgeTone> = { emergency: 'error', urgent: 'warning', normal: 'neutral' };
const VISIBLE = 8;

function QueueRow({ item, duplicate, now, onDiscard }: { item: OutboxItem; duplicate: boolean; now: number; onDiscard: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const critical = item.priority === 'emergency';

  return (
    <View className="gap-2 rounded-xl bg-surface-container-low p-3">
      <View className="flex-row flex-wrap items-center gap-2">
        <Text variant="body-md-medium" className="flex-1">
          {OUTBOX_TYPE_LABEL[item.type]}
        </Text>
        <Badge label={PRIORITY_LABEL[item.priority]} tone={PRIORITY_TONE[item.priority]} />
      </View>
      <View className="flex-row flex-wrap items-center gap-2">
        <SyncStatusBadge status={item.syncStatus} />
        {duplicate ? <Badge label="Posible duplicado" tone="warning" icon="content-duplicate" /> : null}
      </View>
      <Text variant="label-md" tone="muted">
        Guardado {formatRelativeTime(item.createdAt, now)} · Intentos: {item.attempts}
        {item.lastAttemptAt ? ` · Último: ${formatRelativeTime(item.lastAttemptAt, now)}` : ''}
      </Text>
      {item.lastError ? (
        <Text variant="label-md" tone="warning">
          {item.lastError}. Sigue en tu teléfono.
        </Text>
      ) : null}
      {duplicate ? (
        <Text variant="label-md" tone="muted">
          Hay otro reporte crítico parecido. No se unen ni se borran solos: decide tú.
        </Text>
      ) : null}

      {confirming ? (
        <View className="gap-2" accessibilityLiveRegion="polite">
          <Text variant="label-md" tone="error">
            Es un reporte crítico. Si lo quitas de la cola, no se enviará nunca (seguirá guardado en tu
            teléfono).
          </Text>
          <Button label="Sí, quitarlo de la cola" variant="danger" onPress={onDiscard} />
          <Button label="Mejor no" variant="ghost" onPress={() => setConfirming(false)} />
        </View>
      ) : (
        <Button
          label="Quitar de la cola"
          variant="ghost"
          icon="close"
          fullWidth={false}
          onPress={() => (critical ? setConfirming(true) : onDiscard())}
        />
      )}
    </View>
  );
}

function summarize(result: FlushResult): string {
  if (result.attempted === 0) return 'No hay nada pendiente de enviar.';
  if (result.sent > 0 && result.failed === 0) return `${result.sent} enviados.`;
  const reason = result.offline ? 'Sin conexión' : (result.error ?? 'No se pudo enviar');
  return `${reason}: ${result.failed} ${result.failed === 1 ? 'elemento sigue' : 'elementos siguen'} en tu teléfono, pendientes de enviar.`;
}

/** Ajustes → cola de envío: qué está guardado, en qué orden saldría y cuándo se intentó por última vez. */
export function SyncQueueCard() {
  const items = useOutboxStore((s) => s.items);
  const lastAttemptAt = useOutboxStore((s) => s.lastAttemptAt);
  const flushing = useOutboxStore((s) => s.flushing);
  const flush = useOutboxStore((s) => s.flush);
  const discard = useOutboxStore((s) => s.discard);
  const network = useNetworkState();
  const [result, setResult] = useState<FlushResult | undefined>();
  const [showAll, setShowAll] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const unsent = useMemo(() => sortOutgoing(items), [items]);
  const duplicates = useMemo(() => findPossibleDuplicates(items), [items]);
  const offline = network.isConnected === false || network.isInternetReachable === false;
  const shown = showAll ? unsent : unsent.slice(0, VISIBLE);
  const count = (p: OutboxPriority) => unsent.filter((i) => i.priority === p).length;

  const retry = async () => {
    const r = await flush();
    setNow(Date.now());
    setResult(r);
  };

  return (
    <Card>
      <View className="flex-row items-center gap-2">
        <Icon name="tray-arrow-up" size={22} color="primary" />
        <Text variant="headline-sm">Cola de envío</Text>
      </View>
      <Text tone="muted">
        {hasServerTransport()
          ? 'Lo que guardas sale en orden de prioridad cuando hay conexión.'
          : 'Todo queda primero en tu teléfono. Todavía no hay servidor: nada se envía a nadie ni se marca como recibido.'}
      </Text>

      <View className="flex-row flex-wrap gap-2">
        <Badge label={offline ? 'Sin conexión ahora' : 'Con conexión'} tone={offline ? 'warning' : 'neutral'} icon={offline ? 'wifi-off' : 'wifi'} />
        <Badge label={`${unsent.length} en el teléfono`} tone="primary" icon="cellphone-check" />
      </View>
      {unsent.length > 0 ? (
        <Text variant="label-md" tone="muted">
          Saldrían en este orden: {count('emergency')} de emergencia, {count('urgent')} urgentes, {count('normal')} normales.
        </Text>
      ) : null}

      <Text variant="label-md" tone="muted">
        {lastAttemptAt ? `Último intento de envío: ${formatRelativeTime(lastAttemptAt, now)}` : 'Aún no se intentó enviar.'}
      </Text>

      {!isQueuePersistent ? (
        <Text variant="label-md" tone="warning">
          No pudimos abrir el almacenamiento local: esta cola se perderá al cerrar la app.
        </Text>
      ) : null}

      <Button label="Intentar enviar ahora" icon="send-clock-outline" loading={flushing} disabled={unsent.length === 0} onPress={() => void retry()} />
      {result ? (
        <Text accessibilityLiveRegion="polite" variant="label-md">
          {summarize(result)}
        </Text>
      ) : null}

      {unsent.length === 0 ? (
        <Text tone="muted">Nada pendiente. Lo que publiques o reportes aparecerá aquí.</Text>
      ) : (
        <View className="gap-2">
          {shown.map((item) => (
            <QueueRow key={item.id} item={item} duplicate={duplicates.has(item.id)} now={now} onDiscard={() => discard(item.id, true)} />
          ))}
          {unsent.length > VISIBLE ? (
            <Button
              label={showAll ? 'Ver menos' : `Ver los ${unsent.length}`}
              variant="tonal"
              onPress={() => setShowAll((v) => !v)}
            />
          ) : null}
        </View>
      )}
    </Card>
  );
}
