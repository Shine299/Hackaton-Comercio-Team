import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { useUnreadActivityCount } from '@/features/activity/useUnreadActivityCount';
import { useSectorAlerts } from '@/features/emergency';
import {
  categoryText,
  getCategory,
  POST_KIND_LABEL,
  rankPosts,
  useNearbyPosts,
  type Post,
} from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { formatApproxDistance, formatRelativeTime } from '@/shared/format';
import { Badge, Card, DemoTag, Icon, ListenButton, Screen, Text, TextField, type IconName } from '@/shared/ui';

/** Botón grande de «¿Qué quieres hacer?». Una acción por botón, con texto claro. */
function ActionTile({
  title,
  hint,
  icon,
  tone = 'primary',
  onPress,
}: {
  title: string;
  hint: string;
  icon: IconName;
  /** `request` usa el azul de «Pide»; el resto, el teal de las acciones. */
  tone?: 'primary' | 'request';
  onPress: () => void;
}) {
  const request = tone === 'request';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${hint}`}
      onPress={onPress}
      className="min-h-36 flex-1 justify-between rounded-3xl bg-surface-container-lowest p-4 shadow-sm elevation-xs active:opacity-90">
      <View
        className={`h-14 w-14 items-center justify-center rounded-2xl ${
          request ? 'bg-tertiary-fixed' : 'bg-primary-fixed'
        }`}>
        <Icon name={icon} size={32} color={request ? 'tertiary' : 'primary'} />
      </View>
      <View className="gap-0.5">
        <Text variant="headline-sm">{title}</Text>
        <Text variant="label-md" tone="muted">
          {hint}
        </Text>
      </View>
    </Pressable>
  );
}

/** Tarjeta del carrusel «Cerca de ti». */
function NearbyCard({ post, onPress }: { post: Post; onPress: () => void }) {
  const category = getCategory(post.category);
  const offer = post.kind === 'offer';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${POST_KIND_LABEL[post.kind]}: ${post.title}. ${post.author.displayName}, ${formatApproxDistance(post.distanceM)}${post.isDemo ? '. Dato de demostración' : ''}`}
      onPress={onPress}
      className="w-52 overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm elevation-xs active:opacity-90">
      <View className="h-24 items-center justify-center bg-primary-fixed">
        <Icon name={category.icon} size={44} color="primaryContainer" />
      </View>
      <View className="gap-1.5 p-3">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Badge label={POST_KIND_LABEL[post.kind]} tone={offer ? 'primary' : 'secondary'} />
          {post.isDemo ? <DemoTag /> : null}
        </View>
        <Text variant="body-md-medium" numberOfLines={2}>
          {post.title}
        </Text>
        <Text variant="label-md" tone="muted" numberOfLines={1}>
          {post.author.displayName} · {formatApproxDistance(post.distanceM)}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Inicio fácil: lo urgente primero (alerta del sector), luego «¿Qué quieres hacer?» con acciones directas,
 * Emergencia siempre a un toque, el mapa y lo que hay cerca. El detalle de cada cosa vive en su pantalla.
 */
export function HomeScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading } = useNearbyPosts(sector.id);
  const [query, setQuery] = useState('');

  const now = data?.fetchedAt ?? 0;
  const radiusKm = sector.radiusKm;
  const { data: alerts } = useSectorAlerts(sector.id);
  const alert = alerts?.[0];
  const unread = useUnreadActivityCount();

  const nearby = useMemo(() => {
    const inRange = (data?.posts ?? []).filter((p) => p.distanceM / 1000 <= radiusKm);
    return rankPosts(inRange, { now, radiusKm, extraSearchText: categoryText }).slice(0, 5);
  }, [data, now, radiusKm]);

  const search = () =>
    router.push({ pathname: '/explorar', params: query.trim() ? { q: query.trim() } : {} });
  const publish = (kind: 'offer' | 'request') =>
    router.push({ pathname: '/publicar', params: { kind, t: String(Date.now()) } });

  return (
    <Screen noTopInset>
      {alert ? (
        <Card tone={alert.severity === 'critical' ? 'error' : 'warning'} accessibilityLiveRegion="polite">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${alert.title}. Activada por ${alert.source}. Abrir Modo Emergencia`}
            onPress={() => router.push('/emergencias')}
            className="flex-row items-center gap-3 active:opacity-80">
            <Icon name="weather-lightning-rainy" size={26} color={alert.severity === 'critical' ? 'error' : 'warning'} />
            <View className="min-w-0 flex-1">
              <Text variant="body-lg-bold" numberOfLines={2}>
                {alert.title}
              </Text>
              <Text variant="label-md" tone="muted">
                {alert.source} · {formatRelativeTime(alert.createdAt)}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="onSurfaceVariant" />
          </Pressable>
          <ListenButton text={`${alert.title}. ${alert.body} Activada por ${alert.source}.`} />
        </Card>
      ) : null}

      <View className="flex-row items-start gap-2">
        <View className="flex-1">
          <TextField
            label="Buscar en tu barrio"
            hideLabel
            leadingIcon="magnify"
            placeholder="Busca ayuda, herramientas, una bodega…"
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            onSubmitEditing={search}
            returnKeyType="search"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={unread > 0 ? `Ver tu actividad, ${unread} sin leer` : 'Ver tu actividad'}
          onPress={() => router.push('/actividad')}
          className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-lowest shadow-sm elevation-xs active:opacity-80">
          <Icon name="bell-outline" size={24} color="primary" />
          {unread > 0 ? (
            <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1">
              <Text variant="label-sm" tone="onSecondary">
                {unread > 9 ? '9+' : unread}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View className="gap-3">
        <Text variant="headline-sm" accessibilityRole="header">
          ¿Qué quieres hacer?
        </Text>
        <View className="flex-row gap-3">
          <ActionTile
            title="Pedir ayuda"
            hint="Publica lo que necesitas"
            icon="hand-extended-outline"
            tone="request"
            onPress={() => publish('request')}
          />
          <ActionTile
            title="Ofrecer ayuda"
            hint="Presta, regala o da una mano"
            icon="gift-outline"
            onPress={() => publish('offer')}
          />
        </View>
        <View className="flex-row gap-3">
          <ActionTile
            title="Ver el barrio"
            hint="Lo que piden y ofrecen cerca"
            icon="handshake-outline"
            onPress={() => router.push('/explorar')}
          />
          <ActionTile
            title="Negocios"
            hint="Compra y apoya a tu barrio"
            icon="storefront-outline"
            onPress={() => router.push('/negocios')}
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Emergencia. Ayuda en un toque, sin cuenta"
        onPress={() => router.push('/emergencias')}
        className="min-h-20 flex-row items-center gap-4 rounded-3xl bg-error px-4 py-3 active:opacity-90">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-container-lowest">
          <Icon name="lifebuoy" size={30} color="error" />
        </View>
        <View className="min-w-0 flex-1">
          <Text variant="headline-sm" tone="onError">
            Emergencia
          </Text>
          <Text variant="label-md" tone="onError">
            Ayuda en un toque, sin cuenta
          </Text>
        </View>
        <Icon name="chevron-right" size={26} color="onError" />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mapa del barrio. Ayuda, negocios y puntos cerca"
        onPress={() => router.push('/mapa')}
        className="min-h-20 flex-row items-center gap-4 rounded-3xl bg-surface-container-lowest p-3 shadow-sm elevation-xs active:opacity-90">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed">
          <Icon name="map-outline" size={32} color="primary" />
        </View>
        <View className="min-w-0 flex-1">
          <Text variant="headline-sm">Mapa del barrio</Text>
          <Text variant="label-md" tone="muted">
            Ayuda, negocios y puntos cerca
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="onSurfaceVariant" />
      </Pressable>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text variant="headline-sm">Cerca de ti</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver todo lo que hay cerca"
            onPress={() => router.push('/explorar')}
            className="min-h-11 justify-center">
            <Text variant="body-md-medium" tone="primary">
              Ver todo
            </Text>
          </Pressable>
        </View>
        {isLoading ? (
          <View className="items-center py-6" accessibilityLabel="Cargando lo que hay cerca">
            <ActivityIndicator />
          </View>
        ) : nearby.length === 0 ? (
          <Text tone="muted">Cuando haya publicaciones cerca de ti, las verás aquí.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-4 pb-1">
            {nearby.map(({ post }) => (
              <NearbyCard
                key={post.id}
                post={post}
                onPress={() => router.push({ pathname: '/publicacion/[id]', params: { id: post.id } })}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View className="flex-row items-start gap-2">
        <Icon name="shield-lock-outline" size={18} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          La app coordina ayuda entre vecinos y no reemplaza a los servicios oficiales de emergencia.
        </Text>
      </View>
    </Screen>
  );
}
