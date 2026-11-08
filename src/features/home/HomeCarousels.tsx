import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { rubroOf } from '@/features/business/rubros';
import { getCategory, type Post } from '@/features/posts';
import { formatApproxDistance, formatRelativeTime } from '@/shared/format';
import { DemoTag, Icon, Text } from '@/shared/ui';

import { gradientForCategory } from './palette';
import { SECCION_EMPRENDIMIENTOS_XML } from './sectionArt';

const CARD_W = 264;

/** Fila horizontal con títulos y un acceso directo a «ver todo». */
export function Rail({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  subtitle?: string;
  actionLabel: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="-mx-5 gap-3">
      <View className="flex-row items-end justify-between gap-3 px-5">
        <View className="flex-1 gap-0.5">
          <Text variant="headline-sm" accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="label-md" tone="muted">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}: ${title}`}
          onPress={onAction}
          hitSlop={8}
          className="min-h-10 flex-row items-center justify-center rounded-full bg-primary-fixed pl-3 pr-1 active:opacity-70">
          <Text variant="body-md-medium" tone="primary">
            {actionLabel}
          </Text>
          <Icon name="chevron-right" size={20} color="primary" />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-5 pb-2">
        {children}
      </ScrollView>
    </View>
  );
}

function useOpen() {
  const router = useRouter();
  return (post: Post) => router.push({ pathname: '/publicacion/[id]', params: { id: post.id } });
}

/** Novedad del área: una publicación reciente, con degradado por categoría y cuánto hace que salió. */
export function NewsCard({ post, now }: { post: Post; now: number }) {
  const open = useOpen();
  const category = getCategory(post.category);
  const fresh = now - post.createdAt < 6 * 3_600_000;
  const when = formatRelativeTime(post.createdAt, now);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${post.title}. ${category.label}. ${when}. ${formatApproxDistance(post.distanceM)}`}
      onPress={() => open(post)}
      style={{ width: CARD_W }}
      className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-md elevation-sm active:opacity-90">
      <LinearGradient
        colors={gradientForCategory(post.category)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 96, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={category.icon} size={52} color="onPrimary" />
        <View className="absolute left-3 top-3 flex-row items-center gap-1 rounded-xl bg-white/90 px-2.5 py-1">
          <Text variant="label-md" tone="primary">
            {fresh ? '✨ Nuevo · ' : ''}
            {category.label}
          </Text>
        </View>
      </LinearGradient>
      <View className="gap-1 p-3.5">
        <Text variant="body-lg-bold" numberOfLines={2}>
          {post.title}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text variant="label-md" tone="muted" className="flex-1" numberOfLines={1}>
            {when} · {formatApproxDistance(post.distanceM)}
          </Text>
          {post.isDemo ? <DemoTag /> : null}
        </View>
      </View>
    </Pressable>
  );
}

/** Emprendimiento con foto grande (la suya, si la subió; si no, una ilustración del barrio). */
export function BusinessPhotoCard({ post }: { post: Post }) {
  const open = useOpen();
  const rubro = rubroOf(post);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${post.title}. ${rubro.label}. ${formatApproxDistance(post.distanceM)}${post.priceLabel ? `. ${post.priceLabel}` : ''}`}
      onPress={() => open(post)}
      style={{ width: CARD_W }}
      className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-md elevation-sm active:opacity-90">
      <View className="h-44 items-center justify-end overflow-hidden bg-tertiary-fixed">
        {post.photoUri ? (
          <Image source={{ uri: post.photoUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" accessibilityIgnoresInvertColors />
        ) : (
          <LinearGradient
            colors={['#ffd3a8', '#ffb3c7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
            <SvgXml xml={SECCION_EMPRENDIMIENTOS_XML} width={220} height={150} />
          </LinearGradient>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.35)']}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60 }}
        />
        <View className="absolute left-3 top-3 flex-row items-center gap-1 rounded-xl bg-white/90 px-2.5 py-1">
          <Icon name={rubro.icon} size={16} color="primary" />
          <Text variant="label-md" tone="primary">
            {rubro.label}
          </Text>
        </View>
        {post.availableNow ? (
          <View className="absolute right-3 top-3 rounded-xl bg-success px-2.5 py-1">
            <Text variant="label-md" tone="onPrimary">
              Abierto ahora
            </Text>
          </View>
        ) : null}
      </View>
      <View className="gap-1 p-3.5">
        <Text variant="body-lg-bold" numberOfLines={2}>
          {post.title}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text variant="body-md-medium" tone="primary" className="flex-1" numberOfLines={1}>
            {post.priceLabel ?? formatApproxDistance(post.distanceM)}
          </Text>
          {post.isDemo ? <DemoTag /> : null}
        </View>
      </View>
    </Pressable>
  );
}
