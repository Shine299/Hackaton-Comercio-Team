import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ReportCard, useEmergencyStore } from '@/features/emergency';
import { Badge, type Gradient, GRADIENTS, Icon, type IconName, Screen, SECCION_AYUDA_XML, SectionHero, StatRow, Text } from '@/shared/ui';
import { useNearbyPosts } from '@/features/posts';
import { useEasyMode } from '@/shared/nav/viewModeStore';
import { useSectorStore } from '@/features/sector';
import { SectionHeader } from '@/features/shell';

type BigActionProps = {
  title: string;
  hint: string;
  icon: IconName;
  gradient: Gradient;
  onPress: () => void;
};

/** Botón grande de la sección: una sola acción, imposible de confundir. */
function BigAction({ title, hint, icon, gradient, onPress }: BigActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${hint}`}
      onPress={onPress}
      className="min-h-44 flex-1 overflow-hidden rounded-3xl shadow-md elevation-sm active:opacity-90">
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
      <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
        <Icon name={icon} size={32} color="onPrimary" />
      </View>
      <View className="gap-1">
        <Text variant="headline-sm" tone="onPrimary" className="uppercase">
          {title}
        </Text>
        <Text variant="label-md" tone="onPrimary" className="opacity-90">
          {hint}
        </Text>
      </View>
      </LinearGradient>
    </Pressable>
  );
}

/**
 * Ayuda = pedir o dar ayuda entre vecinos. Reúne lo que antes eran Explorar y Publicar (Pide/Ofrece)
 * y el aviso por un vecino vulnerable, que también tiene acceso desde Emergencia.
 */
export function HelpHomeScreen() {
  const router = useRouter();
  const reports = useEmergencyStore((s) => s.reports);
  const easy = useEasyMode();
  const mine = reports.filter((r) => r.kind === 'help').slice(0, 3);
  const sector = useSectorStore((s) => s.sector);
  const { data } = useNearbyPosts(sector.id);
  const nearby = (data?.posts ?? []).filter((p) => p.category !== 'business' && p.status === 'active' && p.distanceM / 1000 <= sector.radiusKm);
  const asking = nearby.filter((p) => p.kind === 'request').length;
  const offering = nearby.filter((p) => p.kind === 'offer').length;

  return (
    <Screen contentClassName="gap-4 px-5 pb-6 pt-4">
      <SectionHeader title="Ayuda" />

      <SectionHero
        gradient={GRADIENTS.ayuda}
        title="Una mano vecina"
        description="Pide u ofrece, sin dar tus datos."
        xml={SECCION_AYUDA_XML}
        steps={[
          { icon: 'hand-back-left-outline', label: 'Pide u ofrece' },
          { icon: 'account-group-outline', label: 'Alguien responde' },
          { icon: 'handshake-outline', label: 'Coordinan' },
        ]}
      />

      <StatRow
        stats={[
          { icon: 'hand-back-left-outline', value: asking, label: 'piden ayuda cerca', gradient: GRADIENTS.ayuda },
          { icon: 'hand-heart-outline', value: offering, label: 'ofrecen cerca', gradient: GRADIENTS.comunidad },
          { icon: 'clipboard-text-clock-outline', value: reports.filter((r) => r.kind === 'help' && r.status !== 'resolved').length, label: 'tus pendientes', gradient: GRADIENTS.recomendado },
        ]}
      />

      <View className={easy ? 'gap-3' : 'flex-row gap-3'}>
        <BigAction
          title="Necesito ayuda"
          hint="Cuéntales qué te hace falta"
          icon="hand-back-left-outline"
          gradient={GRADIENTS.ayuda}
          onPress={() => router.navigate({ pathname: '/publicar', params: { kind: 'request', t: String(Date.now()) } })}
        />
        <BigAction
          title="Quiero ayudar"
          hint="Mira quién necesita una mano"
          icon="hand-heart-outline"
          gradient={GRADIENTS.comunidad}
          onPress={() => router.navigate({ pathname: '/explorar', params: { kind: 'request' } })}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ayudar a un vecino vulnerable. Pide en nombre de quien no puede. Puede tener prioridad"
        onPress={() => router.push('/emergencias/vecino-vulnerable')}
        className="flex-row items-center gap-3 rounded-3xl border-2 border-secondary-fixed bg-surface-container-lowest p-2.5 pr-4 active:opacity-90">
        <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-tertiary-fixed">
          <SvgXml xml={SECCION_AYUDA_XML} width={80} height={60} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="body-lg-bold">Ayudar a un vecino vulnerable</Text>
          <Text variant="label-md" tone="muted">
            Pide en nombre de quien no puede
          </Text>
          <View className="self-start">
            <Badge label="Puede tener prioridad" tone="secondary" icon="alert-circle-outline" />
          </View>
        </View>
        <Icon name="chevron-right" size={22} color="onSurfaceVariant" />
      </Pressable>

      <View className="flex-row items-baseline justify-between px-1 pt-2">
        <Text variant="headline-sm">Mis solicitudes</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver todas mis solicitudes"
          onPress={() => router.push('/emergencias/mis-reportes')}
          className="min-h-11 flex-row items-center justify-center">
          <Text variant="body-md-medium" tone="primary">
            Ver todas
          </Text>
          <Icon name="chevron-right" size={20} color="primary" />
        </Pressable>
      </View>
      {mine.length === 0 ? (
        <Text tone="muted" className="px-1">
          Aún no pediste ayuda desde este teléfono. Lo que pidas aparecerá aquí con su estado real.
        </Text>
      ) : (
        mine.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onPress={() => router.push({ pathname: '/emergencias/estado/[id]', params: { id: report.id } })}
          />
        ))
      )}
    </Screen>
  );
}
