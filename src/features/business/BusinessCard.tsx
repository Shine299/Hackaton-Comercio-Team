import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { Post } from '@/features/posts';
import { formatApproxDistance } from '@/shared/format';
import { DemoTag, Icon, SyncStatusBadge, Text } from '@/shared/ui';

import { DETAIL_DELIVERY, DETAIL_HOURS, detailOf, hasDelivery, rubroOf } from './rubros';

/** Tarjeta de un emprendimiento para la cuadrícula de 2: rubro, nombre, precio, horario y distancia aproximada. */
export function BusinessCard({ post }: { post: Post }) {
  const router = useRouter();
  const rubro = rubroOf(post);
  const hours = detailOf(post, DETAIL_HOURS);
  const delivery = detailOf(post, DETAIL_DELIVERY);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${post.title}. ${rubro.label}. ${formatApproxDistance(post.distanceM)}${post.isDemo ? '. Dato de demostración' : ''}`}
      onPress={() => router.push({ pathname: '/publicacion/[id]', params: { id: post.id } })}
      className="basis-[47%] grow overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm elevation-xs active:opacity-90">
      <View className="h-28 items-center justify-center bg-primary-fixed">
        <Icon name={rubro.icon} size={52} color="primaryContainer" />
      </View>
      <View className="gap-1 p-3">
        <Text variant="body-lg-bold" numberOfLines={2}>
          {post.title}
        </Text>
        {post.priceLabel || (delivery && hasDelivery(post)) ? (
          <Text variant="body-md-medium" tone="primary" numberOfLines={2}>
            {post.priceLabel ?? delivery}
          </Text>
        ) : null}
        <View className="flex-row items-center gap-1">
          <Icon name="near-me" size={15} color="onSurfaceVariant" />
          <Text variant="label-md" tone="muted" className="flex-1" numberOfLines={1}>
            {formatApproxDistance(post.distanceM)}
            {hours ? ` · ${hours}` : post.availableNow ? ' · Abierto' : ''}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-1">
          {post.isOwn && post.syncStatus ? <SyncStatusBadge status={post.syncStatus} /> : null}
          {post.isDemo ? <DemoTag /> : null}
        </View>
      </View>
    </Pressable>
  );
}
