import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Linking, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Badge, cn, colors, GRADIENTS, Icon, type IconName, Screen, SECCION_AYUDA_XML, SectionHero, Text, PressableScale } from '@/shared/ui';
import { useSectorStore } from '@/features/sector';
import { SectionHeader } from '@/features/shell';
import { formatRelativeTime } from '@/shared/format';

import { buildBoard } from './board';
import { EMERGENCY_NUMBERS, formatReviewDate } from './emergencyNumbers';
import { useSectorAlerts } from './sectorAlerts';
import { useEmergencyStore } from './store';

const NUMBER_ICON: Record<string, IconName> = { police: 'police-badge-outline', firefighters: 'fire-truck', ambulance: 'ambulance' };

type OptionProps = { icon: IconName; title: string; onPress: () => void; badge?: string; danger?: boolean };

/** Tarjeta cuadrada de «Más opciones»: un icono y un nombre corto. */
function Option({ icon, title, onPress, badge, danger = false }: OptionProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={badge ? `${title}, ${badge}` : title}
      onPress={onPress}
      className="min-h-28 w-[48%] flex-grow justify-between rounded-3xl bg-surface-container-lowest p-3.5 shadow-sm elevation-xs">
      <View className={cn('h-11 w-11 items-center justify-center rounded-2xl', danger ? 'bg-error-container' : 'bg-primary-fixed')}>
        <Icon name={icon} size={24} color={danger ? 'error' : 'primary'} />
      </View>
      <Text variant="body-lg-bold" className="leading-5">
        {title}
      </Text>
      {badge ? (
        <View className="absolute right-3.5 top-3.5">
          <Badge label={badge} tone="primary" />
        </View>
      ) : null}
    </PressableScale>
  );
}

/**
 * Inicio de Emergencia: un botón enorme para reportar, los 3 números oficiales, lo que pasa cerca de ti y
 * el resto de opciones. «Peligro inmediato» sigue a un toque y sin formulario.
 */
export function EmergencyCenterScreen({ nearbyMap }: { nearbyMap?: ReactNode }) {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const addHelp = useEmergencyStore((s) => s.addHelp);
  const reports = useEmergencyStore((s) => s.reports);
  const vulnerable = useEmergencyStore((s) => s.vulnerable);
  const offers = useEmergencyStore((s) => s.offers);
  const { data: alerts } = useSectorAlerts(sector.id);
  const [now] = useState(() => Date.now());

  const sendImmediateDanger = () => {
    const report = addHelp({ type: 'other', immediateDanger: true });
    router.push({ pathname: '/emergencias/estado/[id]', params: { id: report.id } });
  };

  const nearby = useMemo(
    () =>
      buildBoard({ sectorId: sector.id, sectorName: sector.name, reports, vulnerable, offers, now })
        .filter((item) => item.section === 'incident' || item.section === 'vulnerable')
        .slice(0, 2),
    [sector.id, sector.name, reports, vulnerable, offers, now],
  );
  const alert = alerts?.[0];
  const active = reports.filter((r) => r.status !== 'resolved').length;

  return (
    <Screen safeBottom contentClassName="gap-3 px-5 pb-6 pt-4">
      <SectionHeader title="Emergencia" danger />

      <SectionHero
        compact
        gradient={GRADIENTS.emergencia}
        title="Ayuda rápida, sin cuenta"
        description="Reporta o pide auxilio en pocos toques."
      />

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Reportar emergencia. Sin cuenta, en pocos toques"
        onPress={() => router.push('/emergencias/reportar')}
        className="mt-2 min-h-28 overflow-hidden rounded-[28px] shadow-md elevation-sm">
        <LinearGradient colors={['#c62828', '#ff6a4d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 }}>
        <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-white/20">
          <Icon name="bullhorn-outline" size={40} color="onError" />
        </View>
        <View className="flex-1 gap-1">
          <Text variant="headline-md" tone="onError" className="uppercase">
            Reportar emergencia
          </Text>
          <Text variant="body-md-medium" tone="onError">
            Sin cuenta · en pocos toques
          </Text>
        </View>
        </LinearGradient>
      </PressableScale>

      <View className="flex-row gap-2">
        {EMERGENCY_NUMBERS.entries.map((entry) => (
          <PressableScale
            key={entry.id}
            accessibilityRole="button"
            accessibilityLabel={`Llamar a ${entry.label}, número ${entry.number.split('').join(' ')}`}
            onPress={() => void Linking.openURL(`tel:${entry.number}`)}
            className="min-h-[76px] flex-1 items-center justify-center gap-0.5 rounded-2xl border-2 border-error-container bg-surface-container-lowest">
            <Icon name={NUMBER_ICON[entry.id] ?? 'phone-outline'} size={24} color="error" />
            <Text variant="headline-sm">{entry.number}</Text>
            <Text variant="label-md" tone="muted" numberOfLines={1}>
              {entry.label.replace(' (SAMU)', '')}
            </Text>
          </PressableScale>
        ))}
      </View>
      <Text variant="label-md" tone="muted">
        Números configurados para {EMERGENCY_NUMBERS.territory}, revisados el {formatReviewDate(EMERGENCY_NUMBERS.reviewedAt)}. La app no los
        verifica: confírmalos con tu municipalidad. No reemplaza a los servicios oficiales.
      </Text>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Peligro inmediato. Guarda una alerta mínima en un toque y muestra los números de emergencia"
        onPress={sendImmediateDanger}
        className="min-h-16 flex-row items-center gap-3 rounded-2xl bg-error-container px-4 py-3">
        <Icon name="alarm-light-outline" size={28} color="error" />
        <View className="flex-1">
          <Text variant="body-lg-bold" tone="error">
            Peligro inmediato
          </Text>
          <Text variant="label-md" tone="muted">
            Un toque. Sin formulario.
          </Text>
        </View>
        <Icon name="chevron-right" size={22} color="error" />
      </PressableScale>

      <View className="mt-3 flex-row items-baseline justify-between px-1">
        <Text variant="headline-sm">Cerca de ti</Text>
      </View>
      {alert ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${alert.title}. Activada por ${alert.source}. Ver tablero`}
          onPress={() => router.push('/emergencias/tablero')}
          className="flex-row items-center gap-3 rounded-2xl border-2 border-error bg-surface-container-lowest px-3.5 py-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-error">
            <Icon name="weather-lightning-rainy" size={24} color="onError" />
          </View>
          <View className="min-w-0 flex-1">
            <Text variant="body-lg-bold" numberOfLines={2}>
              {alert.title}
            </Text>
            <Text variant="label-md" tone="error">
              {alert.source} · {formatRelativeTime(alert.createdAt)}
            </Text>
          </View>
          <Icon name="chevron-right" size={22} color="onSurfaceVariant" />
        </PressableScale>
      ) : null}
      {nearby.map((item) => (
        <PressableScale
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${item.validation}. Ver tablero`}
          onPress={() => router.push('/emergencias/tablero')}
          className="flex-row items-center gap-3 rounded-2xl bg-surface-container-lowest px-3.5 py-3 shadow-sm elevation-xs">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-warning-container">
            <Icon name={item.icon} size={24} color="warning" />
          </View>
          <View className="min-w-0 flex-1">
            <Text variant="body-lg-bold" numberOfLines={2}>
              {item.title}
            </Text>
            <Text variant="label-md" tone="muted" numberOfLines={1}>
              {item.validation} · {item.zone}
            </Text>
          </View>
          <Icon name="chevron-right" size={22} color="onSurfaceVariant" />
        </PressableScale>
      ))}
      {!alert && nearby.length === 0 ? <Text tone="muted">Sin avisos activos cerca de ti por ahora.</Text> : null}

      {nearbyMap}

      <Text variant="headline-sm" className="mt-3 px-1">
        Más opciones
      </Text>
      <View className="flex-row flex-wrap justify-between gap-y-2.5">
        <Option icon="hand-back-left-outline" title="Pedir ayuda urgente" danger onPress={() => router.push('/emergencias/necesito-ayuda')} />
        <Option
          icon="clipboard-text-clock-outline"
          title="Mis reportes"
          badge={active > 0 ? `${active} ${active === 1 ? 'activo' : 'activos'}` : undefined}
          onPress={() => router.push('/emergencias/mis-reportes')}
        />
        <Option icon="view-dashboard-outline" title="Tablero de coordinación" onPress={() => router.push('/emergencias/tablero')} />
        <Option icon="hand-heart-outline" title="Ofrecer ayuda" onPress={() => router.push('/emergencias/ofrecer')} />
        <Option icon="package-variant" title="Necesidades y recursos" onPress={() => router.push('/emergencias/recursos')} />
        <Option icon="cctv" title="Cámaras del barrio" badge="Nuevo" onPress={() => router.push('/camaras')} />
        <Option icon="walk" title="Acompáñame: llegué bien" badge="Nuevo" onPress={() => router.push('/emergencias/acompaname')} />
        <Option icon="ear-hearing" title="Modo guardia: pide ayuda con tu voz" badge="Nuevo" onPress={() => router.push('/emergencias/guardia')} />
      </View>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="¿Alguien no puede pedir ayuda? Pide por un vecino vulnerable"
        onPress={() => router.push('/emergencias/vecino-vulnerable')}
        className="mt-1 flex-row items-center gap-3 rounded-3xl bg-primary-container p-2 pr-4">
        <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-primary">
          <SvgXml xml={SECCION_AYUDA_XML} width={64} height={48} />
        </View>
        <View className="flex-1">
          <Text variant="body-lg-bold" tone="onPrimary">
            ¿Alguien no puede pedir ayuda?
          </Text>
          <Text variant="label-md" style={{ color: colors.onPrimaryContainer }}>
            Pide por un vecino vulnerable
          </Text>
        </View>
        <Icon name="chevron-right" size={22} color="onPrimaryContainer" />
      </PressableScale>
    </Screen>
  );
}
