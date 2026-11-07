import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { Post } from '@/features/posts';
import { formatApproxDistance } from '@/shared/format';
import { Badge, DemoTag, Icon, SyncStatusBadge, Text } from '@/shared/ui';

import { DETAIL_DELIVERY, DETAIL_HOURS, detailOf, hasDelivery, rubroOf } from './rubros';

/** Tarjeta grande de un emprendimiento: rubro, horario, entrega, precio y distancia aproximada. */
export function BusinessCard({ post }: { post: Post }) {
  const router = useRouter();
  const rubro = rubroOf(post);
  const hours = detailOf(post, DETAIL_HOURS);
  const delivery = detailOf(post, DETAIL_DELIVERY);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${post.title}. ${rubro.label}. ${formatApproxDistance(post.distanceM)}`}
      onPress={() => router.push({ pathname: '/publicacion/[id]', params: { id: post.id } })}
      className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm elevation-xs active:opacity-90">
      <View className="h-24 items-center justify-center bg-primary-fixed">
        <Icon name={rubro.icon} size={52} color="primaryContainer" />
        <View className="absolute left-3 top-3">
          <Badge label={rubro.label} tone="primary" />
        </View>
      </View>
      <View className="gap-2 p-4">
        <Text variant="headline-sm">{post.title}</Text>
        <View className="flex-row flex-wrap gap-1.5">
          {hours ? <Badge label={hours} tone="primary" icon="clock-outline" /> : null}
          {delivery ? (
            <Badge label={delivery} tone="primary" icon={hasDelivery(post) ? 'moped-outline' : 'map-marker-outline'} />
          ) : null}
          {post.priceLabel ? <Badge label={post.priceLabel} tone="neutral" /> : null}
          {post.availableNow ? <Badge label="Disponible ahora" tone="primary" icon="check-circle-outline" /> : null}
          {post.isOwn && post.syncStatus ? <SyncStatusBadge status={post.syncStatus} /> : null}
        </View>
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="label-md" tone="muted" className="flex-1" numberOfLines={1}>
            {post.author.displayName} · {formatApproxDistance(post.distanceM)}
          </Text>
          {post.isDemo ? <DemoTag /> : null}
        </View>
      </View>
    </Pressable>
  );
}
