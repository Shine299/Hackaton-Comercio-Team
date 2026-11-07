import { View } from 'react-native';

import { hasServerTransport } from '@/features/outbox';
import { Badge, Button, Card, cn, DemoTag, Icon, Text } from '@/shared/ui';

import { getResourceKind, RESOURCE_STAGE_LABEL, RESOURCE_STAGES, type ResourceOffer } from '../types';

type OfferCardProps = {
  offer: ResourceOffer;
  onAdvance?: () => void;
  onCancel?: () => void;
  /** Registra una entrega parcial de `units` unidades. */
  onDeliver?: (units: number) => void;
};

/**
 * Oferta de recurso con su ciclo Ofrecido → … → Confirmado. Con servidor, las etapas las coordina
 * una persona autorizada: aquí solo se ven. Sin servidor, se pueden simular en el teléfono.
 */
export function OfferCard({ offer, onAdvance, onCancel, onDeliver }: OfferCardProps) {
  const kind = getResourceKind(offer.resource);
  const cancelled = offer.stage === 'cancelled';
  const idx = offer.stage === 'cancelled' ? -1 : RESOURCE_STAGES.indexOf(offer.stage);
  const next = idx >= 0 ? RESOURCE_STAGES[idx + 1] : undefined;
  const simulate = !hasServerTransport();

  const quantity = offer.quantity;
  const delivered = offer.delivered ?? 0;
  const remaining = quantity ? quantity - delivered : 0;
  const canDeliver = Boolean(onDeliver && quantity && remaining > 0 && !cancelled && offer.stage !== 'confirmed');

  return (
    <Card>
      <View className="flex-row items-center gap-2">
        <Icon name={kind.icon} size={22} color="primary" />
        <Text variant="body-lg-bold" className="flex-1">
          {kind.label}
        </Text>
        {offer.isDemo ? <DemoTag /> : null}
      </View>
      {offer.note ? <Text tone="muted">{offer.note}</Text> : null}
      <Text variant="label-md" tone="muted">
        Zona aproximada: {offer.sectorName}
      </Text>

      {quantity ? (
        <View className="gap-1" accessibilityLabel={`Entregado ${delivered} de ${quantity} unidades`}>
          <View className="flex-row items-center justify-between">
            <Text variant="label-md">Entregas</Text>
            <Text variant="label-md" tone="muted">
              {delivered} de {quantity}
              {delivered > 0 && remaining > 0 ? ' · entrega parcial' : ''}
            </Text>
          </View>
          <View className="h-1.5 overflow-hidden rounded-full bg-surface-container">
            <View className="h-1.5 rounded-full bg-secondary" style={{ width: `${Math.min(100, (delivered / quantity) * 100)}%` }} />
          </View>
        </View>
      ) : null}

      <View
        className="flex-row gap-1"
        accessibilityLabel={cancelled ? 'Oferta cancelada' : `Etapa ${idx + 1} de ${RESOURCE_STAGES.length}: ${RESOURCE_STAGE_LABEL[offer.stage]}`}>
        {RESOURCE_STAGES.map((stage, i) => (
          <View key={stage} className="flex-1 gap-1">
            <View className={cn('h-1.5 rounded-full', !cancelled && i <= idx ? 'bg-primary' : 'bg-surface-container')} />
            <Text variant="label-sm" tone={i === idx ? 'primary' : 'muted'} numberOfLines={1}>
              {RESOURCE_STAGE_LABEL[stage]}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap gap-2">
        <Badge
          label={cancelled ? 'Cancelado' : RESOURCE_STAGE_LABEL[offer.stage]}
          tone={cancelled ? 'neutral' : offer.stage === 'confirmed' ? 'success' : 'primary'}
          icon={cancelled ? 'close-circle-outline' : 'progress-check'}
        />
        {offer.synced ? (
          <Badge label="Recibido por el servidor" tone="primary" icon="cloud-check-outline" />
        ) : (
          <Badge label="Solo en tu teléfono" tone="warning" icon="cellphone-check" />
        )}
      </View>

      {!cancelled && (onAdvance || onCancel || canDeliver) ? (
        <View className="gap-2">
          {canDeliver ? (
            <View className="flex-row gap-2">
              <Button label="Entregué 1" variant="tonal" icon="package-variant-closed" fullWidth={false} onPress={() => onDeliver?.(1)} />
              {remaining > 1 ? (
                <Button label={`Entregué todo (${remaining})`} variant="tonal" icon="check-all" fullWidth={false} onPress={() => onDeliver?.(remaining)} />
              ) : null}
            </View>
          ) : null}
          {simulate && next && onAdvance ? (
            <Button label={`Marcar como ${RESOURCE_STAGE_LABEL[next].toLowerCase()}`} variant="tonal" icon="arrow-right" onPress={onAdvance} />
          ) : null}
          {offer.stage !== 'confirmed' && onCancel ? (
            <Button label="Cancelar oferta" variant="ghost" icon="close" onPress={onCancel} />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
