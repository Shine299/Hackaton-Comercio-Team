import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { formatApproxDistance, formatRelativeTime } from '@/shared/format';
import { Badge, Icon, SyncStatusBadge, Text } from '@/shared/ui';

import { getCategory, POST_KIND_LABEL, TRUST_LABEL } from '../categories';
import type { Post, TrustLevel } from '../types';

const trustIcon = {
  new: 'sprout-outline',
  verified: 'check-decagram-outline',
  endorsed: 'shield-check-outline',
} as const satisfies Record<TrustLevel, string>;

type PostCardProps = {
  post: Post;
  /** «Ahora» de referencia para los tiempos relativos (viene de los datos cargados). */
  now: number;
  /** Versión reducida (sin descripción ni botón) para listas cortas. */
  compact?: boolean;
};

/**
 * Tarjeta híbrida de publicación: tipo, categoría, distancia aproximada, estado, precio,
 * confianza y acción. Toda la tarjeta es un único elemento accesible.
 */
export function PostCard({ post, now, compact = false }: PostCardProps) {
  const router = useRouter();
  const category = getCategory(post.category);
  const distance = formatApproxDistance(post.distanceM);
  const ago = formatRelativeTime(post.createdAt, now);
  const isOffer = post.kind === 'offer';

  const open = () => router.push({ pathname: '/publicacion/[id]', params: { id: post.id } });

  const a11yLabel = [
    `${POST_KIND_LABEL[post.kind]}: ${post.title}`,
    category.label,
    `${distance} aproximadamente`,
    ago,
    post.priceLabel,
    post.urgent ? 'Necesidad declarada urgente, sin validar' : undefined,
    `${post.author.displayName}, ${TRUST_LABEL[post.author.trust]}`,
    post.isOwn ? 'Publicación tuya, guardada en tu teléfono' : undefined,
    post.isDemo ? 'Dato de demostración' : undefined,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint="Abre el detalle de la publicación"
      onPress={open}
      className="gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm elevation-xs active:opacity-90">
      <View className="flex-row flex-wrap items-center gap-2">
        <Badge label={category.label} tone="neutral" icon={category.icon} />
        {post.urgent ? <Badge label="Urgente · sin validar" tone="error" icon="alert-outline" /> : null}
        {post.isOwn && post.syncStatus ? <SyncStatusBadge status={post.syncStatus} /> : null}
      </View>

      {/* Lo que ofrece o necesita, en un bloque de color propio: verde = ofrece, naranja = necesita. */}
      <View className={`gap-1 rounded-xl border-l-4 px-3 py-2.5 ${isOffer ? 'border-primary bg-primary-fixed' : 'border-secondary bg-secondary-fixed'}`}>
        <View className="flex-row items-center gap-1.5">
          <Icon name={isOffer ? 'gift-outline' : 'hand-extended-outline'} size={16} color={isOffer ? 'primary' : 'secondary'} />
          <Text variant="overline" tone={isOffer ? 'primary' : 'secondary'}>
            {isOffer ? 'Ofrece' : 'Necesita'}
          </Text>
        </View>
        <Text variant="headline-sm" numberOfLines={compact ? 2 : 3}>
          {post.title}
        </Text>
        {!compact ? (
          <Text tone="muted" numberOfLines={2}>
            {post.description}
          </Text>
        ) : null}
      </View>

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
        <View className="flex-row items-center gap-1">
          <Icon name="map-marker-outline" size={16} color="onSurfaceVariant" />
          <Text variant="label-md" tone="muted">
            {distance}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Icon name="clock-outline" size={16} color="onSurfaceVariant" />
          <Text variant="label-md" tone="muted">
            {ago}
          </Text>
        </View>
        {post.priceLabel ? (
          <Text variant="label-md" tone="primary">
            {post.priceLabel}
          </Text>
        ) : null}
        {post.availableNow ? (
          <Text variant="label-md" tone="success">
            Disponible ahora
          </Text>
        ) : null}
      </View>

      <View className={`flex-row items-center justify-between gap-3 rounded-xl p-2.5 ${isOffer ? 'bg-primary-fixed/40' : 'bg-secondary-fixed/50'}`}>
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View className={`h-9 w-9 items-center justify-center rounded-full ${isOffer ? 'bg-primary' : 'bg-secondary'}`}>
            <Text variant="label-md" tone={isOffer ? 'onPrimary' : 'onSecondary'}>
              {post.author.displayName.charAt(0)}
            </Text>
          </View>
          <View className="min-w-0 flex-1">
            <Text variant="body-md-medium" numberOfLines={1}>
              {post.author.displayName}
            </Text>
            <View className="flex-row items-center gap-1">
              <Icon name={trustIcon[post.author.trust]} size={14} color="onSurfaceVariant" />
              <Text variant="label-sm" tone="muted" numberOfLines={1}>
                {TRUST_LABEL[post.author.trust]}
                {post.author.recommendations > 0 ? ` · ${post.author.recommendations} recom.` : ''}
              </Text>
            </View>
          </View>
        </View>
        {!compact ? (
          <View className={`min-h-11 flex-row items-center gap-1.5 rounded-xl px-3.5 ${isOffer ? 'bg-primary' : 'bg-secondary'}`}>
            <Text variant="label-md" tone={isOffer ? 'onPrimary' : 'onSecondary'}>
              {isOffer ? 'Ver y contactar' : 'Ofrecer ayuda'}
            </Text>
          </View>
        ) : null}
      </View>

      {post.isDemo ? (
        <View className="self-start">
          <Badge label="DEMO" tone="warning" icon="flask-outline" />
        </View>
      ) : null}
    </Pressable>
  );
}
