import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { CamerasTeaser } from '@/features/cameras';
import { EventCard, useSectorEvents } from '@/features/events';
import { ReportCard, useEmergencyStore, useSectorAlerts } from '@/features/emergency';
import { FundCard, useSectorFunds } from '@/features/funds';
import { PetTeaser } from '@/features/pets';
import { useNearbyPosts } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { useSessionStore } from '@/features/session';
import { SectionHeader } from '@/features/shell';
import { formatRelativeTime } from '@/shared/format';
import { useEasyMode } from '@/shared/nav/viewModeStore';
import { Badge, Button, Card, DemoTag, GRADIENTS, Icon, ListenButton, PressableScale, Screen, Text } from '@/shared/ui';

import { activeNeighbors, buildHomeFeed } from './feed';
import { FeedCard } from './FeedCard';
import { greetingFor } from './greeting';

/**
 * Inicio = el barrio como comunidad (SPEC-044). Arriba lo que no puede esperar (alerta, Emergencia) y lo que
 * puedes hacer; abajo el feed con las personas y lo que publican, mezclado con los eventos que se vienen.
 */
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
    <Screen contentClassName="gap-5 px-5 pb-8 pt-4">
      <SectionHeader title="Inicio" />

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

      {/* D4 (SPEC-043): Emergencia salió de la barra; aquí y en el SOS sigue a un toque. */}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="¿Emergencia? Reporta o pide auxilio, sin crear cuenta. Abrir Emergencia"
        onPress={() => router.push('/emergencias')}
        className="min-h-16 flex-row items-center gap-3 rounded-3xl bg-error-container px-4 py-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-error">
          <Icon name="alarm-light-outline" size={24} color="onError" />
        </View>
        <View className="min-w-0 flex-1">
          <Text variant="body-lg-bold" tone="error">
            ¿Emergencia?
          </Text>
          <Text variant="label-md" tone="muted">
            Reporta o pide auxilio, sin crear cuenta
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="error" />
      </PressableScale>

      <View className={easy ? 'gap-3' : 'flex-row gap-3'}>
        <Button
          label="Publicar"
          icon="square-edit-outline"
          fullWidth={easy}
          className={easy ? undefined : 'flex-1'}
          onPress={() => router.navigate('/publicar')}
        />
        <Button
          label="Ver eventos"
          variant="tonal"
          icon="calendar-star"
          fullWidth={easy}
          className={easy ? undefined : 'flex-1'}
          onPress={() => router.navigate('/eventos')}
        />
      </View>

      {/* SPEC-049: asistente con IA gratuita (las emergencias nunca pasan por la IA). */}
      <Button
        label="Pregúntale a Yunta"
        variant="outline"
        icon="creation-outline"
        accessibilityLabel="Pregúntale a Yunta: asistente con IA para dudas sobre la app y el barrio"
        onPress={() => router.push('/asistente')}
      />

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
        <View className="flex-row items-center gap-2">
          <Text variant="headline-sm" accessibilityRole="header" className="flex-1">
            Juntos por el barrio
          </Text>
          <Badge label="Nuevo" tone="primary" icon="star-four-points-outline" />
        </View>
        <Text variant="label-md" tone="muted" className="-mt-2">
          Lo que los vecinos de {sector.name} logran entre todos
        </Text>
        {featuredFund ? <FundCard fund={featuredFund} now={fundsData?.fetchedAt ?? 0} /> : null}
        <CamerasTeaser />
        <PetTeaser />
      </View>

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
          feed.map((entry) =>
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

        <Button
          label="Ver todo el Marketplace"
          variant="tonal"
          icon="storefront-outline"
          onPress={() => router.navigate('/publicaciones')}
        />
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
