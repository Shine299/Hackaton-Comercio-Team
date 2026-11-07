import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useUnreadActivityCount } from '@/features/activity/useUnreadActivityCount';
import { useSectorAlerts } from '@/features/emergency';
import { PostCard, categoryText, rankPosts, useNearbyPosts } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { formatRelativeTime } from '@/shared/format';
import { Badge, Button, Card, Icon, ListenButton, Screen, Text, TextField, type IconName } from '@/shared/ui';

/**
 * Entrada a uno de los 4 valores de la app. El Inicio solo muestra estas entradas: la información de
 * cada una aparece al tocarla, para que la pantalla no se vea cargada.
 */
function ValueCard({
  title,
  hint,
  icon,
  tone = 'default',
  badge,
  onPress,
}: {
  title: string;
  hint: string;
  icon: IconName;
  tone?: 'default' | 'emergency';
  badge?: string;
  onPress: () => void;
}) {
  const emergency = tone === 'emergency';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${hint}${badge ? `. ${badge}` : ''}`}
      onPress={onPress}
      className={`min-h-24 flex-row items-center gap-4 rounded-3xl p-4 active:opacity-90 ${
        emergency ? 'bg-error-container' : 'bg-surface-container-lowest shadow-sm elevation-xs'
      }`}>
      <View
        className={`h-14 w-14 items-center justify-center rounded-2xl ${
          emergency ? 'bg-surface-container-lowest' : 'bg-primary-fixed'
        }`}>
        <Icon name={icon} size={30} color={emergency ? 'error' : 'primary'} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="headline-sm" tone={emergency ? 'error' : 'default'}>
          {title}
        </Text>
        <Text variant="label-md" tone="muted">
          {hint}
        </Text>
        {badge ? (
          <View className="mt-1 flex-row">
            <Badge label={badge} tone="error" icon="weather-lightning-rainy" />
          </View>
        ) : null}
      </View>
      <Icon name="chevron-right" size={24} color="onSurfaceVariant" />
    </Pressable>
  );
}

/** Inicio: sector, búsqueda, los 4 valores de la app y recomendaciones. Lo demás vive dentro de cada sección. */
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

  const recommended = useMemo(() => {
    const nearby = (data?.posts ?? []).filter((p) => p.distanceM / 1000 <= radiusKm);
    return rankPosts(nearby, { now, radiusKm, extraSearchText: categoryText }).slice(0, 3);
  }, [data, now, radiusKm]);

  const search = () =>
    router.push({ pathname: '/explorar', params: query.trim() ? { q: query.trim() } : {} });

  return (
    <Screen noTopInset>
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

      <View className="gap-3">
        <ValueCard
          title="Día a día"
          hint="Pide u ofrece ayuda entre vecinos"
          icon="handshake-outline"
          onPress={() => router.push('/explorar')}
        />
        <ValueCard
          title="Confianza"
          hint="Tu perfil, recomendaciones y privacidad"
          icon="shield-check-outline"
          onPress={() => router.push('/perfil')}
        />
        <ValueCard
          title="Emergencia"
          hint="Ayuda en un toque, sin cuenta"
          icon="lifebuoy"
          tone="emergency"
          badge={alert ? 'Alerta activa en tu sector' : undefined}
          onPress={() => router.push('/emergencias')}
        />
        <ValueCard
          title="Emprendimientos"
          hint="Compra y apoya a tu barrio"
          icon="storefront-outline"
          onPress={() => router.push('/negocios')}
        />
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="headline-sm">Recomendado para ti</Text>
          <Badge label="Datos de demostración" tone="warning" icon="flask-outline" />
        </View>
        {isLoading ? (
          <View className="items-center py-6" accessibilityLabel="Cargando recomendaciones">
            <ActivityIndicator />
          </View>
        ) : recommended.length === 0 ? (
          <Text tone="muted">Cuando haya publicaciones cerca de ti, las verás aquí.</Text>
        ) : (
          <View className="gap-3">
            {recommended.map(({ post }) => (
              <PostCard key={post.id} post={post} now={now} compact />
            ))}
          </View>
        )}
      </View>

      <Card tone="low" className="flex-row items-start gap-2">
        <Icon name="shield-lock-outline" size={20} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          La app coordina ayuda entre vecinos y no reemplaza a los servicios oficiales de emergencia.
        </Text>
      </Card>
    </Screen>
  );
}
