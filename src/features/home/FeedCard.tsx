import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StartChatButton } from '@/features/chat';
import { getCategory, type Post } from '@/features/posts';
import { formatApproxDistance, formatRelativeTime } from '@/shared/format';
import { Avatar, Badge, DemoTag, PressableScale, Text } from '@/shared/ui';

import { feedTagFor } from './feed';

type FeedCardProps = {
  post: Post;
  /** «Ahora» de referencia para los tiempos relativos (viene de los datos cargados). */
  now: number;
};

/**
 * Tarjeta del feed del Inicio (SPEC-044): primero la persona (avatar, nombre, distancia, hora), luego qué ofrece o
 * necesita. La parte de arriba es un solo botón accesible que abre la publicación; «Escribir» (SPEC-045) va aparte
 * para no anidar botones.
 */
export function FeedCard({ post, now }: FeedCardProps) {
  const router = useRouter();
  const tag = feedTagFor(post);
  const category = getCategory(post.category);
  const distance = formatApproxDistance(post.distanceM);
  const ago = formatRelativeTime(post.createdAt, now);

  const a11yLabel = [
    `${tag.label}: ${post.title}`,
    `${post.author.displayName}, ${distance} aproximadamente, ${ago}`,
    category.label,
    post.priceLabel,
    post.urgent ? 'Necesidad declarada urgente, sin validar' : undefined,
    post.isDemo ? 'Dato de demostración' : undefined,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <View className="gap-3 rounded-3xl bg-surface-container-lowest p-4 shadow-sm elevation-xs">
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityHint="Abre el detalle de la publicación"
        onPress={() =>
          router.push({
            pathname: '/publicacion/[id]',
            params: { id: post.id },
          })
        }
        className="gap-3">
        <View className="flex-row items-center gap-3">
          <Avatar name={post.author.displayName} id={post.author.id} size={40} />
          <View className="min-w-0 flex-1">
            <Text variant="body-lg-bold" numberOfLines={1}>
              {post.author.displayName}
            </Text>
            <Text variant="label-md" tone="muted" numberOfLines={1}>
              {distance} · {ago}
            </Text>
          </View>
          {post.isDemo ? <DemoTag /> : null}
        </View>

        <View className="flex-row flex-wrap items-center gap-2">
          <Badge label={tag.label} tone={tag.label === 'Necesito' ? 'secondary' : 'primary'} icon={tag.icon} />
          <Badge label={category.label} tone="neutral" icon={category.icon} />
          {post.urgent ? <Badge label="Urgente · sin validar" tone="error" icon="alert-outline" /> : null}
        </View>

        {/* SPEC-054: sin foto no hay bloque de color; la categoría ya va en su etiqueta con ícono. */}
        {post.photoUri ? (
          <View className="h-28 overflow-hidden rounded-2xl">
            <Image
              source={{ uri: post.photoUri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessible={false}
            />
          </View>
        ) : null}

        <View className="gap-1">
          <Text variant="headline-sm" numberOfLines={2}>
            {post.title}
          </Text>
          {post.description ? (
            <Text tone="muted" numberOfLines={2}>
              {post.description}
            </Text>
          ) : null}
        </View>

        {post.priceLabel ? (
          <Text variant="label-md" tone="primary" numberOfLines={1}>
            {post.priceLabel}
          </Text>
        ) : null}
      </PressableScale>
      <StartChatButton post={post} variant="tonal" />
    </View>
  );
}
