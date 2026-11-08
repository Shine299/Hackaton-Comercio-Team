import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ReportCard, useEmergencyStore, useSectorAlerts } from '@/features/emergency';
import { getCategory, HELP_CATEGORIES, PostCard, recommendPosts, useInterestStore, useNearbyPosts, useSavedStore } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { useSessionStore } from '@/features/session';
import { SectionHeader } from '@/features/shell';
import { formatRelativeTime } from '@/shared/format';
import { Button, Card, Chip, type Gradient, GRADIENTS, Icon, ListenButton, Screen, SECCION_AYUDA_XML, SECCION_COMUNIDAD_XML, SECCION_EMERGENCIA_XML, SECCION_EMPRENDIMIENTOS_XML, Text, TextField } from '@/shared/ui';

import { greetingFor } from './greeting';
import { BusinessPhotoCard, NewsCard, Rail } from './HomeCarousels';

/** Qué puedes hacer: una función por sección, con degradado propio, ilustración y un verbo claro. */
function ActionTile({
  verb,
  detail,
  xml,
  gradient,
  onPress,
}: {
  verb: string;
  detail: string;
  xml: string;
  gradient: Gradient;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${verb}. ${detail}`}
      onPress={onPress}
      className="min-h-44 flex-1 overflow-hidden rounded-3xl shadow-md elevation-sm active:opacity-90">
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
        <View className="items-end">
          <View className="h-16 w-20 items-center justify-end overflow-hidden rounded-2xl bg-white/25">
            <SvgXml xml={xml} width={84} height={64} />
          </View>
        </View>
        <View className="gap-0.5">
          <Text variant="headline-sm" tone="onPrimary" numberOfLines={2}>
            {verb}
          </Text>
          <Text variant="label-md" tone="onPrimary" numberOfLines={2} className="opacity-90">
            {detail}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/**
 * Inicio = «¿Qué quieres hacer hoy?». Primero un hero y lo que puedes hacer con la app (una función por sección,
 * cada una con su color); luego cada apartado destaca la suya: novedades del área, emprendimientos con foto,
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

  const [query, setQuery] = useState('');
  const [greeting] = useState(() => greetingFor(new Date().getHours()));
  const search = (q: string) => router.navigate({ pathname: '/explorar', params: { q: q.trim(), t: String(Date.now()) } });

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
    <Screen contentClassName="gap-5 px-5 pb-8 pt-4">
      <SectionHeader title="Inicio" />

      <View className="gap-3">
        <TextField
          label="Buscar en tu barrio"
          hideLabel
          leadingIcon="magnify"
          placeholder="¿Qué buscas? Taladro, almuerzo, costura…"
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          returnKeyType="search"
          onSubmitEditing={() => search(query)}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-5" accessibilityLabel="Búsquedas rápidas">
          {HELP_CATEGORIES.slice(0, 5).map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              icon={c.icon}
              onPress={() => router.navigate({ pathname: '/explorar', params: { category: c.id, t: String(Date.now()) } })}
            />
          ))}
        </ScrollView>
      </View>

      <LinearGradient
        colors={GRADIENTS.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 28, padding: 20, gap: 12 }}>
        <View className="flex-row items-center gap-3">
          <View className="flex-1 gap-1">
            <Text variant="headline-lg" tone="onPrimary" accessibilityRole="header">
              {greeting.text}, {registered && displayName ? displayName : 'vecino'}
            </Text>
            <Text variant="body-lg" tone="onPrimary" className="opacity-95">
              {greeting.line}
            </Text>
          </View>
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white/25">
            <Icon name={greeting.icon} size={32} color="onPrimary" />
          </View>
        </View>
        {news.length > 0 ? (
          <View className="flex-row items-center gap-2 self-start rounded-full bg-white/20 px-3 py-1.5">
            <Icon name="bullhorn-outline" size={16} color="onPrimary" />
            <Text variant="label-md" tone="onPrimary">
              {news.length} {news.length === 1 ? 'novedad' : 'novedades'} hoy en {sector.name}
            </Text>
          </View>
        ) : null}
      </LinearGradient>

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
        <Text variant="headline-sm" accessibilityRole="header">
          ¿En qué te ayudamos hoy?
        </Text>
        <View className="flex-row gap-3">
          <ActionTile
            verb="Descubre qué pasa cerca"
            detail={news.length > 0 ? `${news.length} novedades frescas` : 'Novedades y avisos del área'}
            xml={SECCION_COMUNIDAD_XML}
            gradient={GRADIENTS.comunidad}
            onPress={() => router.navigate('/comunidad')}
          />
          <ActionTile
            verb="Compra local, apoya al barrio"
            detail={shops.length > 0 ? `${shops.length} negocios a pasos de ti` : 'Negocios del barrio'}
            xml={SECCION_EMPRENDIMIENTOS_XML}
            gradient={GRADIENTS.emprendimientos}
            onPress={() => router.navigate('/negocios')}
          />
        </View>
        <View className="flex-row gap-3">
          <ActionTile
            verb="Pide auxilio al instante"
            detail="Reporta sin crear cuenta"
            xml={SECCION_EMERGENCIA_XML}
            gradient={GRADIENTS.emergencia}
            onPress={() => router.navigate('/emergencias')}
          />
          <ActionTile
            verb="Presta, pide, ayuda"
            detail="Herramientas, favores y trueque"
            xml={SECCION_AYUDA_XML}
            gradient={GRADIENTS.ayuda}
            onPress={() => router.navigate('/ayuda')}
          />
        </View>
      </View>

      {news.length > 0 ? (
        <Rail
          title="Lo que se mueve en tu barrio"
          subtitle={`Fresquito en ${sector.name}`}
          actionLabel="Ver todo"
          onAction={() => router.navigate('/comunidad')}>
          {news.map((post) => (
            <NewsCard key={post.id} post={post} now={fetchedAt} />
          ))}
        </Rail>
      ) : null}

      {shops.length > 0 ? (
        <View className="gap-3">
          <Rail
            title="Sabores y oficios de tu zona"
            subtitle="Vecinos que emprenden"
            actionLabel="Ver todos"
            onAction={() => router.navigate('/negocios')}>
            {shops.map((post) => (
              <BusinessPhotoCard key={post.id} post={post} />
            ))}
          </Rail>
          <Button
            label="¡Muestra tu negocio al barrio!"
            variant="tonal"
            icon="storefront-outline"
            onPress={() => router.push('/negocios/registrar')}
          />
        </View>
      ) : null}

      {lending.length > 0 ? (
        <View className="gap-3">
          <View className="gap-0.5">
            <Text variant="headline-sm" accessibilityRole="header">
              Presta hoy, ayuda mañana
            </Text>
            <Text variant="label-md" tone="muted">
              Lo que tus vecinos comparten
            </Text>
          </View>
          {lending.map((post) => (
            <PostCard key={post.id} post={post} now={fetchedAt} compact />
          ))}
          <View className="flex-row gap-2">
            <Button
              label="Busco algo"
              variant="tonal"
              icon="hand-back-left-outline"
              fullWidth={false}
              className="flex-1"
              onPress={() => router.navigate('/publicar')}
            />
            <Button
              label="Quiero compartir"
              icon="hand-heart-outline"
              fullWidth={false}
              className="flex-1"
              onPress={() => router.navigate('/explorar')}
            />
          </View>
        </View>
      ) : null}

      {recommended.length > 0 ? (
        <View className="gap-3" accessibilityLabel="Pensado para ti">
          <View className="gap-0.5">
            <Text variant="headline-sm" accessibilityRole="header">
              Pensado para ti
            </Text>
            <Text variant="label-md" tone="muted">
              {hasHistory
                ? 'Según lo que miras y guardas.'
                : 'Lo más útil cerca de ti.'}
            </Text>
          </View>
          {recommended.map(({ post, reason }) => (
            <View key={post.id} className="gap-1">
              <View className="flex-row items-center gap-1 self-start rounded-full bg-secondary-fixed px-2.5 py-1">
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
