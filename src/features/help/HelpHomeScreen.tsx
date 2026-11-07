import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ReportCard, useEmergencyStore } from '@/features/emergency';
import { SECCION_AYUDA_XML } from '@/features/home/sectionArt';
import { SectionHeader } from '@/features/shell';
import { Badge, Icon, Screen, Text, type IconName } from '@/shared/ui';

type BigActionProps = {
  title: string;
  hint: string;
  icon: IconName;
  bg: string;
  hintColor: string;
  onPress: () => void;
};

/** Botón grande de la sección: una sola acción, imposible de confundir. */
function BigAction({ title, hint, icon, bg, hintColor, onPress }: BigActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${hint}`}
      onPress={onPress}
      style={{ backgroundColor: bg }}
      className="min-h-44 flex-1 justify-between rounded-3xl p-4 active:opacity-90">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
        <Icon name={icon} size={32} color="onPrimary" />
      </View>
      <View className="gap-1">
        <Text variant="headline-sm" tone="onPrimary" className="uppercase">
          {title}
        </Text>
        <Text variant="label-md" style={{ color: hintColor }}>
          {hint}
        </Text>
      </View>
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
  const mine = reports.filter((r) => r.kind === 'help').slice(0, 3);

  return (
    <Screen noTopInset contentClassName="gap-4 px-5 pb-6 pt-14">
      <SectionHeader title="Ayuda" />

      <View className="flex-row gap-3">
        <BigAction
          title="Necesito ayuda"
          hint="Pide apoyo a tus vecinos"
          icon="hand-back-left-outline"
          bg="#003b71"
          hintColor="#d4e3ff"
          onPress={() => router.navigate({ pathname: '/publicar', params: { kind: 'request', t: String(Date.now()) } })}
        />
        <BigAction
          title="Quiero ayudar"
          hint="Mira quién te necesita"
          icon="hand-heart-outline"
          bg="#004243"
          hintColor="#aceeef"
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
