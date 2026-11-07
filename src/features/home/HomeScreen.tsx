import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ReportCard, useEmergencyStore, useSectorAlerts } from '@/features/emergency';
import { useNearbyPosts } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { useSessionStore } from '@/features/session';
import { SectionHeader } from '@/features/shell';
import { formatRelativeTime } from '@/shared/format';
import { Card, Icon, ListenButton, Screen, Text, type IconName } from '@/shared/ui';

import {
  SECCION_AYUDA_XML,
  SECCION_COMUNIDAD_XML,
  SECCION_EMERGENCIA_XML,
  SECCION_EMPRENDIMIENTOS_XML,
} from './sectionArt';

type SectionTileProps = {
  title: string;
  status: string;
  statusIcon: IconName;
  xml: string;
  tone?: 'default' | 'emergency' | 'help';
  onPress: () => void;
};

const TILE_BG = { default: 'bg-primary-fixed', emergency: 'bg-error-container', help: 'bg-tertiary-fixed' } as const;

/** Botón grande e ilustrado de una de las 4 secciones. */
function SectionTile({ title, status, statusIcon, xml, tone = 'default', onPress }: SectionTileProps) {
  const emergency = tone === 'emergency';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${status}`}
      onPress={onPress}
      className={`flex-1 overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm elevation-xs active:opacity-90 ${
        emergency ? 'border-2 border-error-container' : ''
      }`}>
      <View className={`h-28 items-center justify-end overflow-hidden ${TILE_BG[tone]}`}>
        <SvgXml xml={xml} width={150} height={112} />
      </View>
      <View className="gap-1 px-3.5 pb-3.5 pt-3">
        <Text variant="headline-sm" tone={emergency ? 'error' : 'default'} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {title}
        </Text>
        <View className="flex-row items-center gap-1">
          <Icon name={statusIcon} size={16} color={emergency ? 'error' : tone === 'help' ? 'tertiary' : 'primary'} />
          <Text variant="label-md" tone={emergency ? 'error' : 'muted'} className="flex-1" numberOfLines={2}>
            {status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Inicio = «¿Qué necesitas hoy?». Cuatro botones grandes, uno por sección, la alerta del sector (si hay)
 * y lo que tienes pendiente. Las novedades del barrio viven en Comunidad.
 */
export function HomeScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const registered = useSessionStore((s) => s.registered);
  const displayName = useSessionStore((s) => s.displayName);
  const { data } = useNearbyPosts(sector.id);
  const { data: alerts } = useSectorAlerts(sector.id);
  const reports = useEmergencyStore((s) => s.reports);

  const alert = alerts?.[0];
  const posts = (data?.posts ?? []).filter((p) => p.distanceM / 1000 <= sector.radiusKm);
  const businesses = posts.filter((p) => p.category === 'business').length;
  const requests = posts.filter((p) => p.kind === 'request' && p.category !== 'business').length;
  const community = posts.length - businesses;
  const pending = reports.filter((r) => r.status !== 'resolved').slice(0, 2);

  return (
    <Screen noTopInset contentClassName="gap-4 px-5 pb-6 pt-14">
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

      <View className="gap-3" accessibilityLabel="Secciones">
        <View className="flex-row gap-3">
          <SectionTile
            title="Comunidad"
            status={community > 0 ? `${community} novedades cerca` : 'Novedades del barrio'}
            statusIcon="bullhorn-outline"
            xml={SECCION_COMUNIDAD_XML}
            onPress={() => router.navigate('/comunidad')}
          />
          <SectionTile
            title="Emprendimientos"
            status={businesses > 0 ? `${businesses} negocios cerca` : 'Compra y apoya a tu barrio'}
            statusIcon="storefront-outline"
            xml={SECCION_EMPRENDIMIENTOS_XML}
            onPress={() => router.navigate('/negocios')}
          />
        </View>
        <View className="flex-row gap-3">
          <SectionTile
            title="Emergencia"
            status="Reportar o pedir auxilio"
            statusIcon="bullhorn-outline"
            xml={SECCION_EMERGENCIA_XML}
            tone="emergency"
            onPress={() => router.navigate('/emergencias')}
          />
          <SectionTile
            title="Ayuda"
            status={requests > 0 ? `${requests} vecinos piden cerca` : 'Pide u ofrece ayuda'}
            statusIcon="hand-back-left-outline"
            xml={SECCION_AYUDA_XML}
            tone="help"
            onPress={() => router.navigate('/ayuda')}
          />
        </View>
      </View>

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
