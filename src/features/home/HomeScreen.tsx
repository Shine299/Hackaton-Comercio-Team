import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { useUnreadActivityCount } from '@/features/activity/useUnreadActivityCount';
import { useSectorAlerts, useSectorImpact } from '@/features/emergency';
import {
  PostCard,
  POST_CATEGORIES,
  categoryText,
  rankPosts,
  useNearbyPosts,
  type Post,
} from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { formatApproxDistance, formatRelativeTime } from '@/shared/format';
import { Badge, Button, Card, DemoTag, Icon, ListenButton, Screen, Text, TextField, type IconName } from '@/shared/ui';

/** Atajo circular de la fila de accesos: un toque y estás en lo que buscabas. */
type Shortcut = { label: string; icon: IconName; href: Href };

function ShortcutItem({ label, icon, href }: Shortcut) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.push(href)}
      className="w-20 items-center gap-1.5 active:opacity-80">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-lowest shadow-sm elevation-xs">
        <Icon name={icon} size={30} color="primary" />
      </View>
      <Text variant="label-md" className="text-center" numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Tarjeta grande de entrada, con el ícono grande asomando por la esquina. */
function HeroTile({
  title,
  hint,
  icon,
  tone,
  onPress,
}: {
  title: string;
  hint: string;
  icon: IconName;
  tone: 'emergency' | 'business';
  onPress: () => void;
}) {
  const emergency = tone === 'emergency';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${hint}`}
      onPress={onPress}
      className={`h-40 flex-1 justify-between overflow-hidden rounded-3xl p-4 active:opacity-90 ${
        emergency ? 'bg-error-container' : 'bg-primary-fixed'
      }`}>
      <View className="absolute -bottom-3 -right-3 opacity-90">
        <Icon name={icon} size={104} color={emergency ? 'error' : 'primaryContainer'} />
      </View>
      <View className="gap-1">
        <Text variant="headline-sm" tone={emergency ? 'error' : 'primary'}>
          {title}
        </Text>
        <Text variant="label-md" tone="muted" className="max-w-[70%]">
          {hint}
        </Text>
      </View>
    </Pressable>
  );
}

/** Tarjeta ancha con flecha, para saltar al Mapa o al Tablero. */
function WideLink({ label, hint, icon, onPress }: { label: string; hint: string; icon: IconName; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${hint}`}
      onPress={onPress}
      className="min-h-16 flex-1 flex-row items-center gap-2 rounded-2xl bg-surface-container-lowest p-3 shadow-sm elevation-xs active:opacity-80">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-fixed">
        <Icon name={icon} size={22} color="primary" />
      </View>
      <View className="min-w-0 flex-1">
        <Text variant="body-md-medium" numberOfLines={1}>
          {label}
        </Text>
        <Text variant="label-sm" tone="muted" numberOfLines={1}>
          {hint}
        </Text>
      </View>
      <Icon name="chevron-right" size={22} color="onSurfaceVariant" />
    </Pressable>
  );
}

function BusinessCard({ post, onPress }: { post: Post; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${post.title}. ${formatApproxDistance(post.distanceM)}`}
      onPress={onPress}
      className="w-64 gap-2 rounded-2xl bg-surface-container-lowest p-3 shadow-sm elevation-xs active:opacity-80">
      <View className="h-24 items-center justify-center rounded-xl bg-secondary-fixed">
        <Icon name="storefront-outline" size={44} color="secondary" />
      </View>
      <Text variant="body-md-medium" numberOfLines={2}>
        {post.title}
      </Text>
      <View className="flex-row flex-wrap items-center gap-1.5">
        {post.priceLabel ? <Badge label={post.priceLabel} tone="secondary" /> : null}
        {post.availableNow ? <Badge label="Disponible ahora" tone="success" icon="check-circle-outline" /> : null}
      </View>
      <View className="flex-row items-center justify-between gap-2">
        <Text variant="label-md" tone="muted">
          {formatApproxDistance(post.distanceM)}
        </Text>
        {post.isDemo ? <DemoTag /> : null}
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

/** Inicio tipo «super app» del barrio: sector, búsqueda, entradas grandes, accesos, emprendimientos y actividad. */
export function HomeScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading } = useNearbyPosts(sector.id);
  const posts = data?.posts;
  const [query, setQuery] = useState('');

  const now = data?.fetchedAt ?? 0;
  const radiusKm = sector.radiusKm;
  const { data: alerts } = useSectorAlerts(sector.id);
  const alert = alerts?.[0];
  const { data: impact } = useSectorImpact(sector.id);
  const unread = useUnreadActivityCount();

  const nearby = useMemo(
    () => (posts ?? []).filter((p) => p.distanceM / 1000 <= radiusKm),
    [posts, radiusKm],
  );
  const ranked = useMemo(
    () => rankPosts(nearby, { now, radiusKm, extraSearchText: categoryText }),
    [nearby, now, radiusKm],
  );
  const businesses = useMemo(() => ranked.filter((r) => r.post.category === 'business').map((r) => r.post), [ranked]);
  const top = ranked.filter((r) => r.post.category !== 'business').slice(0, 3);

  const search = () =>
    router.push({ pathname: '/explorar', params: query.trim() ? { q: query.trim() } : {} });

  const shortcuts: Shortcut[] = [
    ...POST_CATEGORIES.filter((c) => c.id !== 'business').map<Shortcut>((c) => ({
      label: c.label,
      icon: c.icon,
      href: { pathname: '/explorar', params: { category: c.id } },
    })),
    { label: 'Ofrecer ayuda', icon: 'hand-heart-outline', href: '/emergencias/ofrecer' },
  ];

  return (
    <Screen noTopInset>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Tu sector es ${sector.name}, radio de ${radiusKm} kilómetros. Toca para cambiarlo`}
        onPress={() => router.push('/sector')}
        className="min-h-12 flex-row items-center justify-between gap-2">
        <View>
          <Text variant="label-md" tone="muted">
            Tu comunidad en
          </Text>
          <View className="flex-row items-center gap-1">
            <Icon name="map-marker-radius-outline" size={20} color="primary" />
            <Text variant="headline-sm">
              {sector.name} · {radiusKm} km
            </Text>
            <Icon name="chevron-down" size={22} color="primary" />
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={unread > 0 ? `Ver tu actividad, ${unread} sin leer` : 'Ver tu actividad'}
          onPress={() => router.push('/actividad')}
          className="h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm elevation-xs active:opacity-80">
          <Icon name="bell-outline" size={24} color="primary" />
          {unread > 0 ? (
            <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1">
              <Text variant="label-sm" tone="onSecondary">
                {unread > 9 ? '9+' : unread}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Pressable>

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

      {alert ? (
        <Card tone={alert.severity === 'critical' ? 'error' : 'warning'} accessibilityLiveRegion="polite">
          <View className="flex-row items-center gap-2">
            <Icon name="bullhorn-outline" size={22} color={alert.severity === 'critical' ? 'error' : 'warning'} />
            <Text variant="body-lg-bold" className="flex-1">
              {alert.title}
            </Text>
          </View>
          <Text>{alert.body}</Text>
          <Text variant="label-md" tone="muted">
            Activada por: {alert.source} · {formatRelativeTime(alert.createdAt)}
          </Text>
          <ListenButton text={`${alert.title}. ${alert.body} Activada por ${alert.source}.`} />
          <Button
            label="Abrir Modo Emergencia"
            variant="outline"
            icon="shield-alert-outline"
            onPress={() => router.push('/emergencias')}
          />
        </Card>
      ) : null}

      <View className="flex-row gap-3">
        <HeroTile
          title="Necesito ayuda"
          hint="Emergencias en un toque, sin cuenta"
          icon="lifebuoy"
          tone="emergency"
          onPress={() => router.push('/emergencias')}
        />
        <HeroTile
          title="Emprendimientos"
          hint="Compra y apoya a tu barrio"
          icon="storefront-outline"
          tone="business"
          onPress={() => router.push('/negocios')}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-4">
        {shortcuts.map((s) => (
          <ShortcutItem key={s.label} {...s} />
        ))}
      </ScrollView>

      <View className="flex-row gap-3">
        <WideLink
          label="Mapa del barrio"
          hint="Ayuda y negocios cerca"
          icon="map-outline"
          onPress={() => router.push({ pathname: '/explorar', params: { view: 'map', t: String(Date.now()) } })}
        />
        <WideLink
          label="Tablero"
          hint="Avisos en vivo"
          icon="view-dashboard-outline"
          onPress={() => router.push('/emergencias/tablero')}
        />
      </View>

      {businesses.length > 0 ? (
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text variant="headline-sm">Emprendimientos del barrio</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver todos los emprendimientos"
              onPress={() => router.push('/negocios')}
              className="min-h-11 justify-center">
              <Text variant="body-md-medium" tone="primary">
                Ver todos
              </Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-4">
            {businesses.map((post) => (
              <BusinessCard
                key={post.id}
                post={post}
                onPress={() => router.push({ pathname: '/publicacion/[id]', params: { id: post.id } })}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <Button
        label="Registrar mi emprendimiento"
        icon="store-plus-outline"
        onPress={() => router.push('/negocios/registrar')}
      />

      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="headline-sm">Tu barrio hoy</Text>
          <Badge label="Datos de demostración" tone="warning" icon="flask-outline" />
        </View>
        {isLoading ? (
          <View className="items-center py-6" accessibilityLabel="Cargando actividad">
            <ActivityIndicator />
          </View>
        ) : (
          <View className="flex-row gap-2">
            <Metric value={ranked.length} label="publicaciones activas" />
            <Metric value={businesses.length} label="emprendimientos" />
            <Metric value={impact?.resolvedToday ?? 0} label="avisos atendidos hoy" />
          </View>
        )}
      </View>

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
