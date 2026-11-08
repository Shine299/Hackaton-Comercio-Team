import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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
import { SectionHeader } from '@/features/shell';
import { formatRelativeTime } from '@/shared/format';
import { CommunityMap } from '@/features/map';
import { EventCard } from './EventCard';
import { useSectorEvents } from './sectorEvents';
import { Card, Chip, DemoTag, type Gradient, GRADIENTS, Icon, type IconName, ListenButton, Screen, SECCION_COMUNIDAD_XML, SectionHero, SegmentedControl, StatRow, Text } from '@/shared/ui';



type FeedSection = 'dia' | 'negocios' | 'emergencia' | 'confianza' | 'eventos';
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
  { gradient: Gradient; tagIcon: IconName; tagTone: 'primary' | 'error' | 'muted' }
> = {
  dia: { gradient: GRADIENTS.comunidad, tagIcon: 'handshake-outline', tagTone: 'primary' },
  negocios: { gradient: GRADIENTS.emprendimientos, tagIcon: 'storefront-outline', tagTone: 'primary' },
  emergencia: { gradient: GRADIENTS.emergencia, tagIcon: 'lifebuoy', tagTone: 'error' },
  confianza: { gradient: GRADIENTS.ayuda, tagIcon: 'shield-check-outline', tagTone: 'muted' },
  eventos: { gradient: GRADIENTS.recomendado, tagIcon: 'calendar-star', tagTone: 'primary' },
};

function FeedCard({ item }: { item: FeedItem }) {
  const style = SECTION_STYLE[item.section];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.tag}. ${item.title}. ${item.meta}${item.isDemo ? '. Dato de demostración' : ''}`}
      onPress={item.onPress}
      className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm elevation-xs active:opacity-90">
      <View className="h-36 items-center justify-center overflow-hidden">
        <LinearGradient colors={style.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <Icon name={item.icon} size={64} color="onPrimary" />
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
export function CommunityScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading } = useNearbyPosts(sector.id);
  const { data: alerts } = useSectorAlerts(sector.id);
  const { data: board = [] } = useSharedBoard(sector.id);
  const { data: impact } = useSectorImpact(sector.id);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [view, setView] = useState<'list' | 'map'>('list');
  const { data: eventsData } = useSectorEvents(sector.id, sector.name);

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
        tag: business ? 'Negocios' : `Día a día · ${POST_KIND_LABEL[post.kind]}`,
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
  const events = eventsData?.events ?? [];
  const eventList = filter === 'eventos' ? events : filter === 'all' ? events.slice(0, 2) : [];


  return (
    <View className="flex-1">
    <Screen contentClassName="gap-4 px-5 pb-28 pt-4">
      <SectionHeader title="Comunidad" />

      <SectionHero
        gradient={GRADIENTS.comunidad}
        title="Tu barrio, en vivo"
        description="Lo que pasa cerca de ti."
        xml={SECCION_COMUNIDAD_XML}
        steps={[
          { icon: 'eye-outline', label: 'Mira' },
          { icon: 'message-text-outline', label: 'Contacta' },
          { icon: 'square-edit-outline', label: 'Publica' },
        ]}
      />

      <StatRow
        stats={[
          { icon: 'bullhorn-outline', value: dia.length + biz.length, label: 'novedades cerca', gradient: GRADIENTS.comunidad },
          { icon: 'storefront-outline', value: biz.length, label: 'negocios', gradient: GRADIENTS.emprendimientos },
          { icon: 'lifebuoy', value: board.filter((b) => b.status !== 'resolved').length, label: 'avisos activos', gradient: GRADIENTS.emergencia },
        ]}
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4">
        <Chip role="radio" label="Todo" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip role="radio" label="Eventos" icon="calendar-star" selected={filter === 'eventos'} onPress={() => setFilter('eventos')} />
        <Chip role="radio" label="Día a día" icon="handshake-outline" selected={filter === 'dia'} onPress={() => setFilter('dia')} />
        <Chip role="radio" label="Negocios" icon="storefront-outline" selected={filter === 'negocios'} onPress={() => setFilter('negocios')} />
        <Chip role="radio" label="Emergencia" icon="lifebuoy" selected={filter === 'emergencia'} onPress={() => setFilter('emergencia')} />
      </ScrollView>

      <SegmentedControl
        accessibilityLabel="Ver novedades como"
        value={view}
        onChange={setView}
        options={[
          { value: 'list', label: 'Lista', icon: 'format-list-bulleted' },
          { value: 'map', label: 'Mapa', icon: 'map-outline' },
        ]}
      />

      {view === 'map' ? (
        <CommunityMap posts={[...dia, ...biz]} layers={['posts', 'business', 'incidents']} embedded height={400} />
      ) : isLoading ? (
        <View className="items-center py-8" accessibilityLabel="Cargando novedades">
          <ActivityIndicator />
        </View>
      ) : visible.length === 0 && eventList.length === 0 ? (
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
          {eventList.map((event) => (
            <EventCard key={event.id} event={event} now={eventsData?.fetchedAt ?? 0} />
          ))}
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Publicar en tu barrio"
      onPress={() => router.navigate('/publicar')}
      className="absolute bottom-4 left-5 h-14 flex-row items-center gap-2 rounded-2xl bg-primary px-5 shadow-lg elevation-md active:opacity-90">
      <Icon name="square-edit-outline" size={26} color="onPrimary" />
      <Text variant="body-lg-bold" tone="onPrimary">
        Publicar
      </Text>
    </Pressable>
    </View>
  );
}
