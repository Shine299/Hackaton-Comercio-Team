import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { formatRelativeTime } from '@/shared/format';
import { Badge, Button, Card, DemoTag, Icon, Screen, Text } from '@/shared/ui';

import { BOARD_SECTIONS, buildBoard, type BoardItem } from './board';
import { useEmergencyStore } from './store';

function BoardRow({ item, now, onPress }: { item: BoardItem; now: number; onPress?: () => void }) {
  const priority = item.section === 'vulnerable';
  const content = (
    <View
      className={
        priority
          ? 'gap-2 rounded-2xl border-2 border-error bg-error-container p-3'
          : 'gap-2 rounded-2xl bg-surface-container-lowest p-3 shadow-sm elevation-xs'
      }>
      <View className="flex-row items-start gap-2">
        <Icon name={item.icon} size={22} color={priority ? 'error' : 'primary'} />
        <Text variant="body-md-medium" className="flex-1">
          {item.title}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {priority ? <Badge label="No validada" tone="warning" icon="shield-alert-outline" /> : null}
        {item.isDemo ? <DemoTag /> : null}
      </View>
      <Text variant="label-md" tone="muted">
        Zona aproximada: {item.zone} · {formatRelativeTime(item.at, now)}
      </Text>
      <Text variant="label-md" tone="muted">
        Motivo: {item.reason}
      </Text>
      <Text variant="label-md" tone="muted">
        Fuente: {item.source}
      </Text>
      <Text variant="label-md">Validación: {item.validation}</Text>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}. Ver estado`} onPress={onPress} className="active:opacity-80">
      {content}
    </Pressable>
  );
}

/** Tablero del sector: incidentes, necesidades y recursos (propios + demo), con prioridad visible y honesta. */
export function SectorDashboardScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const reports = useEmergencyStore((s) => s.reports);
  const vulnerable = useEmergencyStore((s) => s.vulnerable);
  const offers = useEmergencyStore((s) => s.offers);
  const [now] = useState(() => Date.now());

  const items = useMemo(
    () => buildBoard({ sectorId: sector.id, sectorName: sector.name, reports, vulnerable, offers, now }),
    [sector.id, sector.name, reports, vulnerable, offers, now],
  );

  return (
    <Screen safeBottom>
      <View className="gap-1">
        <Text variant="headline-md">Tablero de {sector.name}</Text>
        <Text tone="muted">Zona aproximada. Nunca se muestran nombres, teléfonos ni direcciones exactas.</Text>
      </View>

      <Card tone="warning">
        <Text variant="body-lg-bold">Prioridad no es validación</Text>
        <Text>
          Las alertas por un vecino vulnerable aparecen arriba para que se vean primero, pero todavía no
          están validadas por una persona autorizada. Cada renglón indica motivo, fuente, hora y estado.
        </Text>
      </Card>

      {BOARD_SECTIONS.map((section) => {
        const rows = items.filter((i) => i.section === section.id);
        return (
          <View key={section.id} className="gap-2">
            <Text variant="overline" tone={section.id === 'vulnerable' ? 'error' : 'muted'}>
              {section.title}
            </Text>
            {rows.length === 0 ? <Text tone="muted">{section.empty}</Text> : null}
            {rows.map((item) => (
              <BoardRow
                key={item.id}
                item={item}
                now={now}
                onPress={
                  item.reportId
                    ? () => router.push({ pathname: '/emergencias/estado/[id]', params: { id: item.reportId as string } })
                    : undefined
                }
              />
            ))}
          </View>
        );
      })}

      <Button
        label="Ayudar a un vecino vulnerable"
        icon="account-heart-outline"
        variant="outline"
        onPress={() => router.push('/emergencias/vecino-vulnerable')}
      />
    </Screen>
  );
}
