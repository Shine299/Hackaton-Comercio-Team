import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { formatRelativeTime } from '@/shared/format';
import { Badge, Button, Card, DemoTag, Icon, ListenButton, Screen, Text } from '@/shared/ui';

import { BOARD_SECTIONS, buildBoard, type BoardItem } from './board';
import {
  describeSharedItem,
  useRespondToItem,
  useResolveMyItem,
  useSectorImpact,
  useSharedBoard,
  type SharedBoardItem,
} from './sharedBoard';
import { useEmergencyStore } from './store';
import { INCIDENT_STATUS_INFO } from './types';

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

/** Un aviso real de un vecino del sector, con su ciclo: avisar → «voy a ayudar» → «ya llegué» → atendido. */
function SharedRow({ item, sectorId, sectorName, now }: { item: SharedBoardItem; sectorId: string; sectorName: string; now: number }) {
  const respond = useRespondToItem(sectorId);
  const resolve = useResolveMyItem(sectorId);
  const { title, icon } = describeSharedItem(item, sectorName);
  const priority = item.source === 'vulnerable' || item.immediateDanger;
  const canRespond = !item.mine && item.source !== 'incident';
  const resolved = item.status === 'resolved';
  const failed = respond.isError || resolve.isError;

  return (
    <View
      className={
        priority && !resolved
          ? 'gap-2 rounded-2xl border-2 border-error bg-error-container p-3'
          : 'gap-2 rounded-2xl bg-surface-container-lowest p-3 shadow-sm elevation-xs'
      }>
      <View className="flex-row items-start gap-2">
        <Icon name={icon} size={22} color={priority && !resolved ? 'error' : 'primary'} />
        <Text variant="body-md-medium" className="flex-1">
          {title}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {item.mine ? <Badge label="Tu aviso" tone="primary" icon="account-check-outline" /> : null}
        {item.source === 'vulnerable' ? <Badge label="No validada" tone="warning" icon="shield-alert-outline" /> : null}
        <Badge
          label={INCIDENT_STATUS_INFO[item.status].label}
          tone={resolved ? 'success' : 'neutral'}
          icon={INCIDENT_STATUS_INFO[item.status].icon}
        />
        {item.responders > 0 ? (
          <Badge
            label={
              item.arrived > 0
                ? `${item.arrived} ya llegó · ${item.responders} en total`
                : item.responders === 1
                  ? '1 vecino va en camino'
                  : `${item.responders} vecinos van en camino`
            }
            tone="success"
            icon="walk"
          />
        ) : null}
      </View>
      <Text variant="label-md" tone="muted">
        Zona aproximada: {sectorName} · {formatRelativeTime(item.createdAt, now)} · Fuente: un vecino de tu sector
      </Text>

      <ListenButton
        text={`${title} ${INCIDENT_STATUS_INFO[item.status].label}.${
          item.responders > 0 ? ` ${item.responders} ${item.responders === 1 ? 'vecino va' : 'vecinos van'} en camino.` : ''
        } Zona aproximada: ${sectorName}.`}
      />

      {item.mine && item.responderNames.length > 0 ? (
        <Text variant="label-md" tone="primary">
          Van en camino: {item.responderNames.join(', ')}
        </Text>
      ) : null}
      {item.mine && item.responders === 0 && !resolved ? (
        <Text variant="label-md" tone="muted">
          Todavía nadie respondió. Si hay riesgo para la vida, llama a los números oficiales.
        </Text>
      ) : null}

      {canRespond && !resolved ? (
        item.iRespond === 'on_the_way' ? (
          <View className="flex-row gap-2">
            <Button
              label="Ya llegué"
              icon="map-marker-check-outline"
              className="flex-1"
              loading={respond.isPending}
              onPress={() => respond.mutate({ targetId: item.id, status: 'arrived' })}
            />
            <Button
              label="Ya no puedo ir"
              variant="outline"
              className="flex-1"
              onPress={() => respond.mutate({ targetId: item.id, status: 'withdrawn' })}
            />
          </View>
        ) : item.iRespond === 'arrived' ? (
          <Badge label="Marcaste que ya llegaste" tone="success" icon="check-circle-outline" />
        ) : (
          <Button
            label="Voy a ayudar"
            icon="hand-heart-outline"
            loading={respond.isPending}
            onPress={() => respond.mutate({ targetId: item.id, status: 'on_the_way' })}
          />
        )
      ) : null}

      {item.mine && !resolved && item.source !== 'incident' ? (
        <Button
          label="Ya fue atendido"
          variant="tonal"
          icon="check-circle-outline"
          loading={resolve.isPending}
          onPress={() => resolve.mutate(item.id)}
        />
      ) : null}

      {failed ? (
        <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
          No se pudo enviar al servidor. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      ) : null}
    </View>
  );
}

/** Tablero del sector: avisos reales de vecinos en vivo, más lo guardado en tu teléfono y datos de demo etiquetados. */
export function SectorDashboardScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const reports = useEmergencyStore((s) => s.reports);
  const vulnerable = useEmergencyStore((s) => s.vulnerable);
  const offers = useEmergencyStore((s) => s.offers);
  const [now] = useState(() => Date.now());
  const { data: shared = [] } = useSharedBoard(sector.id);
  const { data: impact } = useSectorImpact(sector.id);

  const sharedIds = useMemo(() => new Set(shared.map((s) => s.id)), [shared]);

  // Lo que el servidor ya muestra en vivo no se repite en la lista local.
  const items = useMemo(
    () =>
      buildBoard({
        sectorId: sector.id,
        sectorName: sector.name,
        reports: reports.filter((r) => !sharedIds.has(r.id)),
        vulnerable: vulnerable.filter((v) => !sharedIds.has(v.id)),
        offers,
        now,
      }),
    [sector.id, sector.name, reports, vulnerable, offers, now, sharedIds],
  );

  const sharedOpen = shared.filter((s) => s.status !== 'resolved');
  const sharedDone = shared.filter((s) => s.status === 'resolved');

  return (
    <Screen safeBottom>
      <View className="gap-1">
        <Text variant="headline-md">Tablero de {sector.name}</Text>
        <Text tone="muted">Zona aproximada. Nunca se muestran nombres, teléfonos ni direcciones exactas.</Text>
      </View>

      {impact ? (
        <View className="flex-row gap-2">
          <View className="flex-1 items-center gap-0.5 rounded-xl bg-primary-fixed py-3">
            <Text variant="headline-md" tone="primary">
              {impact.resolvedToday}
            </Text>
            <Text variant="label-sm" tone="muted" className="text-center">
              avisos atendidos hoy
            </Text>
          </View>
          <View className="flex-1 items-center gap-0.5 rounded-xl bg-primary-fixed py-3">
            <Text variant="headline-md" tone="primary">
              {impact.respondersToday}
            </Text>
            <Text variant="label-sm" tone="muted" className="text-center">
              vecinos respondieron
            </Text>
          </View>
        </View>
      ) : null}

      <Card tone="warning">
        <Text variant="body-lg-bold">Prioridad no es validación</Text>
        <Text>
          Las alertas por un vecino vulnerable aparecen arriba para que se vean primero, pero todavía no
          están validadas por una persona autorizada. Cada renglón indica motivo, fuente, hora y estado.
        </Text>
      </Card>

      {sharedOpen.length > 0 || sharedDone.length > 0 ? (
        <View className="gap-2">
          <Text variant="overline" tone="primary">
            Avisos de vecinos de tu sector (en vivo)
          </Text>
          {sharedOpen.map((item) => (
            <SharedRow key={item.id} item={item} sectorId={sector.id} sectorName={sector.name} now={now} />
          ))}
          {sharedDone.map((item) => (
            <SharedRow key={item.id} item={item} sectorId={sector.id} sectorName={sector.name} now={now} />
          ))}
        </View>
      ) : null}

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
