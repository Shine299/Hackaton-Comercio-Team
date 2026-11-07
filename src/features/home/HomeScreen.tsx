import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useSectorAlerts } from '@/features/emergency';
import {
  PostCard,
  POST_CATEGORIES,
  categoryText,
  rankPosts,
  useNearbyPosts,
  type PostCategoryId,
} from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { formatRelativeTime } from '@/shared/format';
import { Badge, Button, Card, Icon, Screen, Text, TextField, type IconName } from '@/shared/ui';

function greeting(hour: number): string {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

type QuickAction = {
  label: string;
  hint: string;
  icon: IconName;
  onPress: () => void;
  tone: 'primary' | 'secondary' | 'error';
};

function QuickActionTile({ label, hint, icon, onPress, tone }: QuickAction) {
  const iconBg =
    tone === 'error' ? 'bg-error-container' : tone === 'secondary' ? 'bg-secondary-fixed' : 'bg-primary-fixed';
  const iconColor = tone === 'error' ? 'error' : tone === 'secondary' ? 'secondary' : 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${hint}`}
      onPress={onPress}
      className="min-h-24 flex-1 justify-between gap-3 rounded-2xl bg-surface-container-lowest p-3 shadow-sm elevation-xs active:opacity-80">
      <View className={`h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon name={icon} size={22} color={iconColor} />
      </View>
      <View>
        <Text variant="body-md-medium">{label}</Text>
        <Text variant="label-sm" tone="muted" numberOfLines={2}>
          {hint}
        </Text>
      </View>
    </Pressable>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center gap-0.5 rounded-xl bg-surface-container-low py-3">
      <Text variant="headline-md" tone="primary">
        {value}
      </Text>
      <Text variant="label-sm" tone="muted" className="text-center">
        {label}
      </Text>
    </View>
  );
}

/** Inicio inteligente: sector, búsqueda, aviso contextual, acciones rápidas y actividad cercana. */
export function HomeScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading } = useNearbyPosts(sector.id);
  const posts = data?.posts;
  const [query, setQuery] = useState('');
  // Saludo según la hora al abrir la pantalla (estado inicial, no cambia durante el render).
  const [hour] = useState(() => new Date().getHours());

  const now = data?.fetchedAt ?? 0;
  const radiusKm = sector.radiusKm;
  const { data: alerts } = useSectorAlerts(sector.id);
  const alert = alerts?.[0];

  const nearby = useMemo(
    () => (posts ?? []).filter((p) => p.distanceM / 1000 <= radiusKm),
    [posts, radiusKm],
  );
  const ranked = useMemo(
    () => rankPosts(nearby, { now, radiusKm, extraSearchText: categoryText }),
    [nearby, now, radiusKm],
  );
  const top = ranked.slice(0, 3);
  const activeCount = ranked.length;
  const offerCount = ranked.filter((r) => r.post.kind === 'offer').length;
  const requestCount = ranked.filter((r) => r.post.kind === 'request').length;

  const categoryCounts = useMemo(() => {
    const counts = new Map<PostCategoryId, number>();
    for (const { post } of ranked) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    return counts;
  }, [ranked]);

  const search = () =>
    router.push({ pathname: '/explorar', params: query.trim() ? { q: query.trim() } : {} });

  return (
    <Screen noTopInset>
      <View className="gap-1">
        <Text variant="headline-lg" accessibilityRole="header">
          {greeting(hour)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Tu sector es ${sector.name}. Toca para cambiarlo`}
          onPress={() => router.push('/sector')}
          className="min-h-11 flex-row items-center gap-1.5 self-start">
          <Icon name="map-marker-radius-outline" size={18} color="primary" />
          <Text variant="body-md-medium" tone="primary">
            {sector.name} · {radiusKm} km
          </Text>
          <Text variant="body-md" tone="muted">
            · Cambiar
          </Text>
        </Pressable>
      </View>

      <TextField
        label="Buscar en tu barrio"
        hideLabel
        leadingIcon="magnify"
        placeholder="¿Qué necesitas o qué puedes ofrecer?"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        onSubmitEditing={search}
        returnKeyType="search"
      />

      {alert ? (
        <Card tone={alert.severity === 'critical' ? 'error' : 'warning'} accessibilityLiveRegion="polite">
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-1 flex-row items-center gap-2">
              <Icon name="bullhorn-outline" size={22} color={alert.severity === 'critical' ? 'error' : 'warning'} />
              <Text variant="body-lg-bold" className="flex-1">
                {alert.title}
              </Text>
            </View>
          </View>
          <Text>{alert.body}</Text>
          <Text variant="label-md" tone="muted">
            Activada por: {alert.source} · {formatRelativeTime(alert.createdAt)}
          </Text>
          <Button
            label="Abrir Modo Emergencia"
            variant="outline"
            icon="shield-alert-outline"
            onPress={() => router.push('/emergencias')}
          />
        </Card>
      ) : null}

      <View className="gap-2">
        <Text variant="headline-sm">Acciones rápidas</Text>
        <View className="flex-row gap-2">
          <QuickActionTile
            label="Explorar"
            hint="Ver lo que hay cerca"
            icon="compass-outline"
            tone="primary"
            onPress={() => router.push('/explorar')}
          />
          <QuickActionTile
            label="Publicar"
            hint="Ofrecer o solicitar"
            icon="plus-circle-outline"
            tone="secondary"
            onPress={() => router.push('/publicar')}
          />
          <QuickActionTile
            label="Necesito ayuda"
            hint="Modo Emergencia"
            icon="lifebuoy"
            tone="error"
            onPress={() => router.push('/emergencias')}
          />
        </View>
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="headline-sm">Actividad cerca de ti</Text>
          <Badge label="Datos de demostración" tone="warning" icon="flask-outline" />
        </View>
        {isLoading ? (
          <View className="items-center py-6" accessibilityLabel="Cargando actividad">
            <ActivityIndicator />
          </View>
        ) : (
          <View className="flex-row gap-2">
            <Metric value={activeCount} label="publicaciones activas" />
            <Metric value={offerCount} label="ofrecimientos" />
            <Metric value={requestCount} label="solicitudes" />
          </View>
        )}
      </View>

      {categoryCounts.size > 0 ? (
        <View className="gap-2">
          <Text variant="headline-sm">Categorías cercanas</Text>
          <View className="flex-row flex-wrap gap-2">
            {POST_CATEGORIES.filter((c) => categoryCounts.has(c.id)).map((category) => (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityLabel={`${category.label}, ${categoryCounts.get(category.id)} publicaciones`}
                onPress={() => router.push({ pathname: '/explorar', params: { category: category.id } })}
                className="min-h-11 flex-row items-center gap-2 rounded-full bg-surface-container px-3.5 active:opacity-80">
                <Icon name={category.icon} size={18} color="primary" />
                <Text variant="label-md">{category.label}</Text>
                <View className="min-w-5 items-center rounded-full bg-primary px-1.5">
                  <Text variant="label-sm" tone="onPrimary">
                    {categoryCounts.get(category.id)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {top.length > 0 ? (
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text variant="headline-sm">Para ti, cerca</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver todas las publicaciones en Explorar"
              onPress={() => router.push('/explorar')}
              className="min-h-11 justify-center">
              <Text variant="body-md-medium" tone="primary">
                Ver todas
              </Text>
            </Pressable>
          </View>
          <View className="gap-3">
            {top.map(({ post }) => (
              <PostCard key={post.id} post={post} now={now} compact />
            ))}
          </View>
        </View>
      ) : null}

      <Card tone="low" className="flex-row items-start gap-2">
        <Icon name="shield-lock-outline" size={20} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          Tus datos privados no se muestran hasta que ambas personas confirmen. La app coordina
          ayuda entre vecinos y no reemplaza a los servicios oficiales de emergencia.
        </Text>
      </Card>
    </Screen>
  );
}
