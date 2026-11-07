import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useUnreadActivityCount } from '@/features/activity/useUnreadActivityCount';
import { useSectorAlerts, useSectorImpact, useSharedBoard } from '@/features/emergency';
import {
  categoryText,
  getCategory,
  POST_KIND_LABEL,
  rankPosts,
  TRUST_LABEL,
  useNearbyPosts,
  type Post,
} from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { formatRelativeTime } from '@/shared/format';
import { Badge, Card, Chip, DemoTag, Icon, ListenButton, Screen, Text, TextField, type IconName } from '@/shared/ui';

import { HERO_BARRIO_XML } from './heroBarrio';

type FeedSection = 'dia' | 'negocios' | 'emergencia' | 'confianza';
type FeedFilter = 'all' | Exclude<FeedSection, 'confianza'>;

type FeedItem = {
  id: string;
  section: FeedSection;
  tag: string;
  title: string;
  meta: string;
  icon: IconName;
  isDemo: boolean;
  onPress: () => void;
};

/** Color de cada sección en el resumen. Siempre acompañado del nombre de la sección. */
const SECTION_STYLE: Record<
  FeedSection,
  { bg: string; icon: 'primaryContainer' | 'error' | 'onSurfaceVariant'; tagIcon: IconName; tagTone: 'primary' | 'error' | 'muted' }
> = {
  dia: { bg: 'bg-primary-fixed', icon: 'primaryContainer', tagIcon: 'handshake-outline', tagTone: 'primary' },
  negocios: { bg: 'bg-primary-fixed', icon: 'primaryContainer', tagIcon: 'storefront-outline', tagTone: 'primary' },
  emergencia: { bg: 'bg-error-container', icon: 'error', tagIcon: 'lifebuoy', tagTone: 'error' },
  confianza: { bg: 'bg-surface-container-high', icon: 'onSurfaceVariant', tagIcon: 'shield-check-outline', tagTone: 'muted' },
};

/** Entrada grande a una de las 4 funciones de la app. */
function ValueTile({
  title,
  hint,
  icon,
  tone = 'default',
  onPress,
}: {
  title: string;
  hint: string;
  icon: IconName;
  tone?: 'default' | 'emergency';
  onPress: () => void;
}) {
  const emergency = tone === 'emergency';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${hint}`}
      onPress={onPress}
      className={`min-h-36 flex-1 justify-between rounded-3xl p-4 active:opacity-90 ${
        emergency ? 'bg-error-container' : 'bg-surface-container-lowest shadow-sm elevation-xs'
      }`}>
      <View
        className={`h-12 w-12 items-center justify-center rounded-2xl ${
          emergency ? 'bg-surface-container-lowest' : 'bg-primary-fixed'
        }`}>
        <Icon name={icon} size={28} color={emergency ? 'error' : 'primary'} />
      </View>
      <View className="gap-0.5">
        <Text
          variant="body-lg-bold"
          tone={emergency ? 'error' : 'default'}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}>
          {title}
        </Text>
        <Text variant="label-md" tone="muted" numberOfLines={3}>
          {hint}
        </Text>
      </View>
    </Pressable>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const style = SECTION_STYLE[item.section];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.tag}. ${item.title}. ${item.meta}${item.isDemo ? '. Dato de demostración' : ''}`}
      onPress={item.onPress}
      className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm elevation-xs active:opacity-90">
      <View className={`h-36 items-center justify-center ${style.bg}`}>
        <Icon name={item.icon} size={64} color={style.icon} />
        <View className="absolute left-3 top-3 flex-row items-center gap-1.5 rounded-xl bg-surface-container-lowest px-2.5 py-1.5">
          <Icon name={style.tagIcon} size={16} color={style.tagTone === 'error' ? 'error' : style.tagTone === 'primary' ? 'primary' : 'onSurfaceVariant'} />
          <Text variant="label-md" tone={style.tagTone}>
            {item.tag}
          </Text>
        </View>
      </View>
      <View className="gap-1.5 p-4">
        <Text variant="headline-sm">{item.title}</Text>
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="label-md" tone="muted" className="flex-1">
            {item.meta}
          </Text>
          {item.isDemo ? <DemoTag /> : null}
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Inicio = novedades del barrio. Junta lo nuevo de las 4 secciones (Día a día, Emprendimientos,
 * Emergencia y Confianza). Para entrar a una sección se usa la barra inferior.
 */
export function HomeScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading } = useNearbyPosts(sector.id);
  const { data: alerts } = useSectorAlerts(sector.id);
  const { data: board = [] } = useSharedBoard(sector.id);
  const { data: impact } = useSectorImpact(sector.id);
  const unread = useUnreadActivityCount();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FeedFilter>('all');

  const alert = alerts?.[0];
  const now = data?.fetchedAt ?? 0;
  const radiusKm = sector.radiusKm;

  const { dia, biz } = useMemo(() => {
    const inRange = (data?.posts ?? []).filter((p) => p.distanceM / 1000 <= radiusKm);
    const ranked = rankPosts(inRange, { now, radiusKm, extraSearchText: categoryText }).map((r) => r.post);
    return { dia: ranked.filter((p) => p.category !== 'business'), biz: ranked.filter((p) => p.category === 'business') };
  }, [data, now, radiusKm]);

  const items = useMemo(() => {
    const open = (post: Post) => () => router.push({ pathname: '/publicacion/[id]', params: { id: post.id } });
    const distance = (post: Post) => (post.distanceM <= 0 ? 'En tu sector' : `A ${Math.max(50, Math.round(post.distanceM / 50) * 50)} m`);

    const fromPost = (post: Post): FeedItem => {
      const business = post.category === 'business';
      return {
        id: post.id,
        section: business ? 'negocios' : 'dia',
        tag: business ? 'Emprendimientos' : `Día a día · ${POST_KIND_LABEL[post.kind]}`,
        title: post.title,
        meta: `${post.author.displayName} · ${formatRelativeTime(post.createdAt, now)} · ${distance(post)}`,
        icon: business ? 'storefront-outline' : getCategory(post.category).icon,
        isDemo: post.isDemo,
        onPress: open(post),
      };
    };

    const activeNotices = board.filter((b) => b.status !== 'resolved').length;
    const emergency: FeedItem = {
      id: 'feed-emergencia',
      section: 'emergencia',
      tag: 'Emergencia',
      title:
        activeNotices > 0
          ? `${activeNotices} ${activeNotices === 1 ? 'aviso activo' : 'avisos activos'} en el tablero de ${sector.name}`
          : `Sin avisos activos en ${sector.name}`,
      meta: impact?.resolvedToday
        ? `${impact.resolvedToday} ${impact.resolvedToday === 1 ? 'atendido' : 'atendidos'} hoy`
        : 'Si necesitas ayuda, Emergencia está a un toque',
      icon: 'lifebuoy',
      isDemo: false,
      onPress: () => router.push('/emergencias/tablero'),
    };

    const trusted = [...dia, ...biz]
      .filter((p) => p.author.trust !== 'new')
      .sort((a, b) => b.author.recommendations - a.author.recommendations)[0];
    const trust: FeedItem | undefined = trusted
      ? {
          id: `feed-confianza-${trusted.author.id}`,
          section: 'confianza',
          tag: 'Confianza',
          title: `${trusted.author.displayName}: ${TRUST_LABEL[trusted.author.trust]}`,
          meta: `${trusted.author.recommendations} recomendaciones de vecinos`,
          icon: 'shield-check-outline',
          isDemo: trusted.isDemo,
          onPress: () => router.push({ pathname: '/vecino/[id]', params: { id: trusted.author.id } }),
        }
      : undefined;

    // Intercalado para que cada sección aparezca pronto: negocio, vecinos, emergencia, vecinos, confianza…
    const order = [biz[0], dia[0], emergency, dia[1], trust, biz[1], dia[2]];
    return order.map((entry) => (entry && 'section' in entry ? entry : entry ? fromPost(entry) : undefined)).filter(
      (entry): entry is FeedItem => Boolean(entry),
    );
  }, [biz, dia, board, impact, now, router, sector.name]);

  const visible = items.filter((item) => filter === 'all' || item.section === filter);
  const anyDemo = dia.some((p) => p.isDemo) || biz.some((p) => p.isDemo);

  const search = () => router.push({ pathname: '/explorar', params: query.trim() ? { q: query.trim() } : {} });

  return (
    <Screen noTopInset>
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-0.5">
          <View className="flex-row items-center gap-1">
            <Icon name="map-marker-radius-outline" size={17} color="primary" />
            <Text variant="label-md" tone="muted">
              {sector.name} · {radiusKm} km
            </Text>
          </View>
          <Text variant="headline-lg" accessibilityRole="header">
            Lo nuevo en tu barrio
          </Text>
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${alert.title}. Activada por ${alert.source}. Abrir Emergencia`}
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

      <View className="gap-3">
        <View className="flex-row gap-3">
          <ValueTile
            title="Día a día"
            hint="Pide u ofrece ayuda entre vecinos"
            icon="handshake-outline"
            onPress={() => router.push('/explorar')}
          />
          <ValueTile
            title="Confianza"
            hint="Tu perfil, recomendaciones y privacidad"
            icon="shield-check-outline"
            onPress={() => router.push('/perfil')}
          />
        </View>
        <View className="flex-row gap-3">
          <ValueTile
            title="Emergencia"
            hint="Ayuda en un toque, sin cuenta"
            icon="lifebuoy"
            tone="emergency"
            onPress={() => router.push('/emergencias')}
          />
          <ValueTile
            title="Emprendimientos"
            hint="Compra y apoya a tu barrio"
            icon="storefront-outline"
            onPress={() => router.push('/negocios')}
          />
        </View>
      </View>

      <View className="h-44 overflow-hidden rounded-3xl bg-primary-fixed">
        <View className="absolute -bottom-5 -right-7">
          <SvgXml xml={HERO_BARRIO_XML} width={230} height={192} />
        </View>
        <View className="max-w-[62%] gap-1.5 p-5">
          <Text variant="label-md" tone="primary" className="uppercase">
            {sector.name} hoy
          </Text>
          <Text variant="headline-md">Tu barrio está en movimiento</Text>
          <View className="mt-1 flex-row flex-wrap gap-1.5">
            <Badge label={`${dia.length} ayudas`} tone="neutral" />
            <Badge label={`${biz.length} negocios`} tone="neutral" />
          </View>
        </View>
        {anyDemo ? (
          <View className="absolute bottom-3 left-5">
            <DemoTag />
          </View>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4">
        <Chip role="radio" label="Todo" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip role="radio" label="Día a día" icon="handshake-outline" selected={filter === 'dia'} onPress={() => setFilter('dia')} />
        <Chip role="radio" label="Negocios" icon="storefront-outline" selected={filter === 'negocios'} onPress={() => setFilter('negocios')} />
        <Chip role="radio" label="Emergencia" icon="lifebuoy" selected={filter === 'emergencia'} onPress={() => setFilter('emergencia')} />
      </ScrollView>

      {isLoading ? (
        <View className="items-center py-8" accessibilityLabel="Cargando novedades">
          <ActivityIndicator />
        </View>
      ) : visible.length === 0 ? (
        <Card className="items-center gap-2 py-8">
          <Icon name="text-box-search-outline" size={34} color="primary" />
          <Text variant="headline-sm" className="text-center">
            Todavía no hay novedades aquí
          </Text>
          <Text tone="muted" className="text-center">
            Cuando haya algo nuevo en esta sección, lo verás en esta lista.
          </Text>
        </Card>
      ) : (
        <View className="gap-4">
          {visible.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </View>
      )}

      <View className="flex-row items-start gap-2">
        <Icon name="shield-lock-outline" size={18} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          La app coordina ayuda entre vecinos y no reemplaza a los servicios oficiales de emergencia.
        </Text>
      </View>
    </Screen>
  );
}
