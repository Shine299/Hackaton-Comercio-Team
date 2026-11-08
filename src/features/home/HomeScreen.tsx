import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AssistantHomeCard } from '@/features/assistant';
import { CamerasTeaser } from '@/features/cameras';
import { EventCard, useSectorEvents } from '@/features/events';
import { ReportCard, useEmergencyStore, useSectorAlerts } from '@/features/emergency';
import { FundCard, useSectorFunds } from '@/features/funds';
import { GuardHomeCard } from '@/features/guard';
import { PetTeaser } from '@/features/pets';
import { useNearbyPosts } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { useSessionStore } from '@/features/session';
import { SectionHeader } from '@/features/shell';
import { formatRelativeTime } from '@/shared/format';
import { useEasyMode } from '@/shared/nav/viewModeStore';
import {
  Button,
  Card,
  DemoTag,
  GRADIENTS,
  Icon,
  ListenButton,
  PressableScale,
  Screen,
  SECCION_AYUDA_XML,
  SECCION_COMUNIDAD_XML,
  SECCION_EMERGENCIA_XML,
  SECCION_EMPRENDIMIENTOS_XML,
  Text,
} from '@/shared/ui';

import { ActionTile } from './ActionTile';
import { activeNeighbors, buildHomeFeed } from './feed';
import { FeedCard } from './FeedCard';
import { greetingFor } from './greeting';

/**
 * Inicio = el barrio como comunidad (SPEC-044). Arriba lo que no puede esperar (alerta, Emergencia) y lo que
 * puedes hacer; abajo el feed con las personas y lo que publican, mezclado con los eventos que se vienen.
 */
/** Cuántas novedades se ven de entrada; el resto está tras «Ver más novedades». */
const FEED_PREVIEW = 5;

export function HomeScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const registered = useSessionStore((s) => s.registered);
  const displayName = useSessionStore((s) => s.displayName);
  const { data, isLoading } = useNearbyPosts(sector.id);
  const { data: alerts } = useSectorAlerts(sector.id);
  const reports = useEmergencyStore((s) => s.reports);
  const { data: eventsData } = useSectorEvents(sector.id, sector.name);
  const { data: fundsData } = useSectorFunds();

  const easy = useEasyMode();
  const [greeting] = useState(() => greetingFor(new Date().getHours()));
  const [showAllFeed, setShowAllFeed] = useState(false);

  const alert = alerts?.[0];
  const now = data?.fetchedAt ?? eventsData?.fetchedAt ?? 0;
  const featuredFund = fundsData?.funds.find((f) => f.goalCents != null) ?? fundsData?.funds[0];
  const pending = reports.filter((r) => r.status !== 'resolved').slice(0, 2);

  const feed = useMemo(
    () => buildHomeFeed({ posts: data?.posts ?? [], events: eventsData?.events ?? [], now, radiusKm: sector.radiusKm }),
    [data?.posts, eventsData?.events, now, sector.radiusKm],
  );
  const neighbors = useMemo(() => activeNeighbors(data?.posts ?? [], now), [data?.posts, now]);

  return (
    <Screen safeBottom contentClassName="gap-5 px-5 pb-24 pt-4">
      <SectionHeader />

      <LinearGradient
        colors={GRADIENTS.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 28, padding: 18, gap: 10 }}>
        <View className="gap-1">
          <Text variant="headline-lg" tone="onPrimary" accessibilityRole="header">
            {greeting.text}, {registered && displayName ? displayName : 'vecino'}
          </Text>
          <Text variant="body-lg" tone="onPrimary" className="opacity-95">
            {greeting.line}
          </Text>
        </View>
        {easy ? <ListenButton text={`${greeting.text}. ${greeting.line}`} /> : null}
        {neighbors.count > 0 ? (
          <View className="flex-row flex-wrap items-center gap-2">
            <View className="flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-1.5">
              <Icon name="account-group-outline" size={16} color="onPrimary" />
              <Text variant="label-md" tone="onPrimary">
                {neighbors.count} {neighbors.count === 1 ? 'vecino activo' : 'vecinos activos'} esta semana en{' '}
                {sector.name}
              </Text>
            </View>
            {neighbors.isDemo ? <DemoTag /> : null}
          </View>
        ) : null}
      </LinearGradient>

      {alert ? (
        <Card tone={alert.severity === 'critical' ? 'error' : 'warning'} accessibilityLiveRegion="polite">
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`${alert.title}. Activada por ${alert.source}. Abrir Emergencia`}
            onPress={() => router.push('/emergencias')}
            className="flex-row items-center gap-3">
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
          </PressableScale>
          <ListenButton text={`${alert.title}. ${alert.body} Activada por ${alert.source}.`} />
        </Card>
      ) : null}

      {/* SPEC-051: el Inicio no tiene barra; estos 4 botones llevan a cada sección. Emergencia sigue a un toque. */}
      <View className="gap-3" accessibilityLabel="Qué puedes hacer con la app">
        <Text variant="headline-sm" accessibilityRole="header">
          ¿En qué te ayudamos hoy?
        </Text>
        <View className={easy ? 'gap-3' : 'flex-row gap-3'}>
          <ActionTile
            tourId="tile-comunidad"
            stacked={easy}
            verb="Descubre qué pasa cerca"
            detail="Eventos y novedades del barrio"
            xml={SECCION_COMUNIDAD_XML}
            gradient={GRADIENTS.comunidad}
            onPress={() => router.navigate('/eventos')}
          />
          <ActionTile
            tourId="tile-negocios"
            stacked={easy}
            verb="Compra local, apoya al barrio"
            detail="Negocios y lugares a pasos de ti"
            xml={SECCION_EMPRENDIMIENTOS_XML}
            gradient={GRADIENTS.emprendimientos}
            onPress={() => router.navigate('/explorar')}
          />
        </View>
        <View className={easy ? 'gap-3' : 'flex-row gap-3'}>
          <ActionTile
            tourId="tile-emergencia"
            stacked={easy}
            verb="Pide auxilio al instante"
            detail="Reporta sin crear cuenta"
            xml={SECCION_EMERGENCIA_XML}
            gradient={GRADIENTS.emergencia}
            onPress={() => router.push('/emergencias')}
          />
          <ActionTile
            tourId="tile-ayuda"
            stacked={easy}
            verb="Presta, pide, ayuda"
            detail="Herramientas, favores y trueque"
            xml={SECCION_AYUDA_XML}
            gradient={GRADIENTS.ayuda}
            onPress={() => router.navigate('/ayuda')}
          />
        </View>
      </View>

      {/* SPEC-052: Modo guardia. Enciende o apaga la escucha por voz en toda la app. */}
      <GuardHomeCard />

      {/* SPEC-053: hablar con Yunta (resumen hablado del barrio y conversación por voz). */}
      <AssistantHomeCard />

      {/* Novedades del barrio: las 5 más recientes y «Ver más». */}
      <View className="gap-4">
        <View className="gap-0.5">
          <Text variant="headline-sm" accessibilityRole="header">
            Lo nuevo en tu barrio
          </Text>
          <Text variant="label-md" tone="muted">
            Lo que tus vecinos ofrecen, necesitan y organizan
          </Text>
        </View>

        {isLoading ? (
          <View className="items-center py-8" accessibilityLabel="Cargando novedades">
            <ActivityIndicator />
          </View>
        ) : feed.length === 0 ? (
          <Card className="items-center gap-2 py-8">
            <Icon name="text-box-search-outline" size={34} color="primary" />
            <Text variant="headline-sm" className="text-center">
              Todavía no hay novedades aquí
            </Text>
            <Text tone="muted" className="text-center">
              Sé el primero: publica algo que ofreces o necesitas.
            </Text>
          </Card>
        ) : (
          (showAllFeed ? feed : feed.slice(0, FEED_PREVIEW)).map((entry) =>
            entry.type === 'post' ? (
              <FeedCard key={entry.id} post={entry.post} now={now} />
            ) : (
              <EventCard
                key={entry.id}
                event={entry.event}
                now={now}
                compact
                onPress={() => router.push({ pathname: '/evento/[id]', params: { id: entry.event.id } })}
              />
            ),
          )
        )}

        {feed.length > FEED_PREVIEW ? (
          <Button
            label={showAllFeed ? 'Ver menos novedades' : `Ver más novedades (${feed.length - FEED_PREVIEW})`}
            variant="tonal"
            icon={showAllFeed ? 'chevron-up' : 'chevron-down'}
            onPress={() => setShowAllFeed((value) => !value)}
          />
        ) : null}
        <Button
          label="Ver todas las publicaciones"
          variant="tonal"
          icon="storefront-outline"
          onPress={() => router.navigate('/publicaciones')}
        />
      </View>

      <View className={easy ? 'gap-3' : 'flex-row gap-3'}>
        <Button
          label="Publicar"
          icon="square-edit-outline"
          fullWidth={easy}
          className={easy ? undefined : 'flex-1'}
          onPress={() => router.navigate('/publicar')}
        />
        {/* SPEC-049: asistente con IA gratuita (las emergencias nunca pasan por la IA). */}
        <Button
          label="Pregunta a Yunta"
          variant="tonal"
          icon="creation-outline"
          fullWidth={easy}
          className={easy ? undefined : 'flex-1'}
          accessibilityLabel="Pregúntale a Yunta: asistente con IA para dudas sobre la app y el barrio"
          onPress={() => router.push('/asistente')}
        />
      </View>

      {pending.length > 0 ? (
        <View className="gap-3">
          <Text variant="headline-sm" accessibilityRole="header">
            Tienes pendiente
          </Text>
          {pending.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPress={() => router.push({ pathname: '/emergencias/estado/[id]', params: { id: report.id } })}
            />
          ))}
        </View>
      ) : null}

      <View className="gap-3" accessibilityLabel="Juntos por el barrio: fondos, cámaras y el perrito comunitario">
        <Text variant="headline-sm" accessibilityRole="header">
          Juntos por el barrio
        </Text>
        {featuredFund ? <FundCard fund={featuredFund} now={fundsData?.fetchedAt ?? 0} /> : null}
        <CamerasTeaser />
        <PetTeaser />
      </View>

      <View className="flex-row items-start gap-2 px-1">
        <Icon name="information-outline" size={18} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          La app coordina ayuda entre vecinos y no reemplaza a los servicios oficiales de emergencia.
        </Text>
      </View>
    </Screen>
  );
}
