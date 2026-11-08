import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ReportCard, useEmergencyStore, useSectorAlerts } from '@/features/emergency';
import { getCategory, PostCard, recommendPosts, useInterestStore, useNearbyPosts, useSavedStore } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { useSessionStore } from '@/features/session';
import { SectionHeader } from '@/features/shell';
import { formatRelativeTime } from '@/shared/format';
import { Button, Card, Icon, ListenButton, Screen, Text } from '@/shared/ui';

import { BusinessPhotoCard, NewsCard, Rail } from './HomeCarousels';
import { SECCION_AYUDA_XML, SECCION_COMUNIDAD_XML, SECCION_EMERGENCIA_XML, SECCION_EMPRENDIMIENTOS_XML } from './sectionArt';

const TILE_BG = { default: 'bg-primary-fixed', emergency: 'bg-error-container', help: 'bg-tertiary-fixed' } as const;

/** Qué puedes hacer: una función principal por sección, con ilustración y un verbo claro. */
function ActionTile({
  verb,
  detail,
  xml,
  tone = 'default',
  onPress,
}: {
  verb: string;
  detail: string;
  xml: string;
  tone?: keyof typeof TILE_BG;
  onPress: () => void;
}) {
  const emergency = tone === 'emergency';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${verb}. ${detail}`}
      onPress={onPress}
      className={`flex-1 overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm elevation-xs active:opacity-90 ${emergency ? 'border-2 border-error-container' : ''}`}>
      <View className={`h-24 items-center justify-end overflow-hidden ${TILE_BG[tone]}`}>
        <SvgXml xml={xml} width={130} height={98} />
      </View>
      <View className="gap-0.5 px-3 pb-3 pt-2.5">
        <Text variant="body-lg-bold" tone={emergency ? 'error' : 'default'} numberOfLines={2}>
          {verb}
        </Text>
        <Text variant="label-md" tone="muted" numberOfLines={2}>
          {detail}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Inicio = «¿Qué necesitas hoy?». Primero, lo que puedes hacer con la app (una función por sección); luego cada
 * apartado destaca la suya: novedades del área, emprendimientos con foto,
 * lo que se presta entre vecinos y recomendaciones según lo que la persona mira. Cada tarjeta abre directo
 * el detalle, para llegar con el menor número de toques.
 */
export function HomeScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const registered = useSessionStore((s) => s.registered);
  const displayName = useSessionStore((s) => s.displayName);
  const { data } = useNearbyPosts(sector.id);
  const { data: alerts } = useSectorAlerts(sector.id);
  const reports = useEmergencyStore((s) => s.reports);
  const categoryViews = useInterestStore((s) => s.categoryViews);
  const viewedIds = useInterestStore((s) => s.viewedIds);
  const savedPostIds = useSavedStore((s) => s.postIds);

  const alert = alerts?.[0];
  const fetchedAt = data?.fetchedAt ?? 0;
  const posts = useMemo(
    () => (data?.posts ?? []).filter((p) => p.distanceM / 1000 <= sector.radiusKm),
    [data?.posts, sector.radiusKm],
  );

  const news = useMemo(
    () => posts.filter((p) => !p.isOwn && p.status === 'active').sort((x, y) => y.createdAt - x.createdAt).slice(0, 6),
    [posts],
  );
  const shops = useMemo(() => posts.filter((p) => p.category === 'business' && p.status === 'active').slice(0, 6), [posts]);
  const lending = useMemo(
    () =>
      posts
        .filter((p) => ['tools', 'products', 'barter'].includes(p.category) && p.kind === 'offer' && p.status === 'active')
        .slice(0, 3),
    [posts],
  );

  const recommended = useMemo(() => {
    const savedCategories = (data?.posts ?? []).filter((p) => savedPostIds.includes(p.id)).map((p) => p.category);
    return recommendPosts(
      data?.posts ?? [],
      { now: fetchedAt, radiusKm: sector.radiusKm },
      { categoryViews, viewedIds, savedCategories },
      4,
    );
  }, [data?.posts, fetchedAt, sector.radiusKm, categoryViews, viewedIds, savedPostIds]);
  const hasHistory = Object.keys(categoryViews).length > 0;
  const pending = reports.filter((r) => r.status !== 'resolved').slice(0, 2);

  return (
    <Screen noTopInset contentClassName="gap-5 px-5 pb-6 pt-14">
      <SectionHeader
        eyebrow={
          <View className="gap-0.5">
            <Text variant="label-md" tone="muted">
              {registered && displayName ? `Hola, ${displayName}` : 'Hola, vecino'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Tu sector: ${sector.name}, ${sector.radiusKm} kilómetros. Cambiar`}
              onPress={() => router.push('/sector')}
              className="min-h-7 flex-row items-center gap-0.5 self-start">
              <Icon name="map-marker" size={18} color="primary" />
              <Text variant="body-md-medium" tone="primary">
                {sector.name} · {sector.radiusKm} km
              </Text>
              <Icon name="chevron-down" size={20} color="primary" />
            </Pressable>
          </View>
        }
      />

      <Text variant="headline-lg" accessibilityRole="header" className="mt-1">
        ¿Qué necesitas hoy?
      </Text>

      {alert ? (
        <Card tone={alert.severity === 'critical' ? 'error' : 'warning'} accessibilityLiveRegion="polite">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${alert.title}. Activada por ${alert.source}. Abrir Emergencia`}
            onPress={() => router.push('/emergencias')}
            className="flex-row items-center gap-3 active:opacity-80">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-error">
              <Icon name="weather-lightning-rainy" size={20} color="onError" />
            </View>
            <View className="min-w-0 flex-1">
              <Text variant="body-lg-bold" tone="error" numberOfLines={2}>
                {alert.title}
              </Text>
              <Text variant="label-md" tone="muted">
                {alert.source} · {formatRelativeTime(alert.createdAt)}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="error" />
          </Pressable>
          <ListenButton text={`${alert.title}. ${alert.body} Activada por ${alert.source}.`} />
        </Card>
      ) : null}

      <View className="gap-3" accessibilityLabel="Qué puedes hacer con la app">
        <Text variant="label-md" tone="muted">
          Con la app puedes:
        </Text>
        <View className="flex-row gap-3">
          <ActionTile
            verb="Enterarte de tu barrio"
            detail={news.length > 0 ? `${news.length} novedades cerca` : 'Novedades y avisos del área'}
            xml={SECCION_COMUNIDAD_XML}
            onPress={() => router.navigate('/comunidad')}
          />
          <ActionTile
            verb="Comprar a tus vecinos"
            detail={shops.length > 0 ? `${shops.length} negocios cerca` : 'Emprendimientos del barrio'}
            xml={SECCION_EMPRENDIMIENTOS_XML}
            onPress={() => router.navigate('/negocios')}
          />
        </View>
        <View className="flex-row gap-3">
          <ActionTile
            verb="Pedir auxilio o reportar"
            detail="Sin cuenta y a un toque"
            xml={SECCION_EMERGENCIA_XML}
            tone="emergency"
            onPress={() => router.navigate('/emergencias')}
          />
          <ActionTile
            verb="Prestar y pedir ayuda"
            detail="Herramientas, favores y trueque"
            xml={SECCION_AYUDA_XML}
            tone="help"
            onPress={() => router.navigate('/ayuda')}
          />
        </View>
      </View>

      {news.length > 0 ? (
        <Rail
          title="Novedades en tu área"
          subtitle={`Lo último en ${sector.name}`}
          actionLabel="Ver todo"
          onAction={() => router.navigate('/comunidad')}>
          {news.map((post) => (
            <NewsCard key={post.id} post={post} now={fetchedAt} />
          ))}
        </Rail>
      ) : null}

      {shops.length > 0 ? (
        <Rail
          title="Emprendimientos cerca"
          subtitle="Compra y apoya a tu barrio"
          actionLabel="Ver todos"
          onAction={() => router.navigate('/negocios')}>
          {shops.map((post) => (
            <BusinessPhotoCard key={post.id} post={post} />
          ))}
        </Rail>
      ) : null}
      <Button label="Registrar mi emprendimiento" variant="tonal" icon="storefront-outline" onPress={() => router.push('/negocios/registrar')} />

      {lending.length > 0 ? (
        <View className="gap-3">
          <View className="gap-0.5">
            <Text variant="headline-sm" accessibilityRole="header">
              Para prestar y pedir prestado
            </Text>
            <Text variant="label-md" tone="muted">
              Herramientas y cosas que tus vecinos comparten
            </Text>
          </View>
          {lending.map((post) => (
            <PostCard key={post.id} post={post} now={fetchedAt} compact />
          ))}
          <View className="flex-row gap-2">
            <Button label="Necesito algo" variant="tonal" icon="hand-back-left-outline" fullWidth={false} className="flex-1" onPress={() => router.navigate('/publicar')} />
            <Button label="Quiero ayudar" icon="hand-heart-outline" fullWidth={false} className="flex-1" onPress={() => router.navigate('/explorar')} />
          </View>
        </View>
      ) : null}

      {recommended.length > 0 ? (
        <View className="gap-3" accessibilityLabel="Recomendado para ti">
          <View className="gap-0.5">
            <Text variant="headline-sm" accessibilityRole="header">
              Recomendado para ti
            </Text>
            <Text variant="label-md" tone="muted">
              {hasHistory ? 'Según lo que más miras y guardas.' : 'Lo más útil cerca de ti. Mejora a medida que explores.'}
            </Text>
          </View>
          {recommended.map(({ post, reason }) => (
            <View key={post.id} className="gap-1">
              <View className="flex-row items-center gap-1 px-1">
                <Icon name={getCategory(post.category).icon} size={16} color="primary" />
                <Text variant="label-md" tone="primary">
                  {reason}
                </Text>
              </View>
              <PostCard post={post} now={fetchedAt} compact />
            </View>
          ))}
        </View>
      ) : null}

      {pending.length > 0 ? (
        <View className="gap-3">
          <Text variant="headline-sm">Tienes pendiente</Text>
          {pending.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPress={() => router.push({ pathname: '/emergencias/estado/[id]', params: { id: report.id } })}
            />
          ))}
        </View>
      ) : null}

      <View className="flex-row items-start gap-2 px-1">
        <Icon name="information-outline" size={18} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          La app coordina ayuda entre vecinos y no reemplaza a los servicios oficiales de emergencia.
        </Text>
      </View>
    </Screen>
  );
}
