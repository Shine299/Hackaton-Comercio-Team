import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useSectorAlerts } from '@/features/emergency';
import { useOutboxStore } from '@/features/outbox';
import { useContactStore, useLocalPostsStore, usePost } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { formatRelativeTime } from '@/shared/format';
import { Button, Card, Chip, DemoTag, Icon, Screen, SyncStatusBadge, Text } from '@/shared/ui';

import { ACTIVITY_FILTERS, buildActivityFeed, filterFeed, type ActivityEntry, type ActivityFilter } from './feed';
import { useActivityReadStore } from './readStore';

function PostTitle({ postId }: { postId: string }) {
  const { data } = usePost(postId);
  if (!data) return null;
  return (
    <Text variant="label-md" tone="muted" numberOfLines={1}>
      Sobre: {data.post.title}
    </Text>
  );
}

type RowProps = { entry: ActivityEntry; unread: boolean; now: number; onPress: () => void };

function ActivityRow({ entry, unread, now, onPress }: RowProps) {
  const alert = entry.category === 'alerts';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${unread ? 'No leído. ' : ''}${entry.title}. ${formatRelativeTime(entry.at, now)}`}
      onPress={onPress}
      className={
        alert
          ? 'flex-row gap-3 rounded-2xl border-2 border-error-container bg-surface-container-lowest p-3 active:opacity-80'
          : 'flex-row gap-3 rounded-2xl bg-surface-container-lowest p-3 shadow-sm elevation-xs active:opacity-80'
      }>
      <View className={alert ? 'h-10 w-10 items-center justify-center rounded-xl bg-error-container' : 'h-10 w-10 items-center justify-center rounded-xl bg-primary-fixed'}>
        <Icon name={entry.icon} size={22} color={alert ? 'error' : 'primary'} />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text variant={unread ? 'body-lg-bold' : 'body-md-medium'} className="flex-1" numberOfLines={2}>
            {entry.title}
          </Text>
          {unread ? <View className="h-2.5 w-2.5 rounded-full bg-error" accessibilityLabel="No leído" /> : null}
        </View>
        {entry.subtitle ? (
          <Text variant="label-md" tone="muted" numberOfLines={2}>
            {entry.subtitle}
          </Text>
        ) : null}
        {entry.postId ? <PostTitle postId={entry.postId} /> : null}
        <View className="flex-row flex-wrap items-center gap-2">
          {entry.isDemo ? <DemoTag /> : null}
          {entry.syncStatus ? <SyncStatusBadge status={entry.syncStatus} /> : null}
          <Text variant="label-sm" tone="muted">
            {formatRelativeTime(entry.at, now)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/** Bandeja de Actividad: cola local + solicitudes de contacto. Leído/no leído solo en el teléfono. */
export function ActivityScreen() {
  const router = useRouter();
  const outbox = useOutboxStore((s) => s.items);
  const contacts = useContactStore((s) => s.requests);
  const localPosts = useLocalPostsStore((s) => s.posts);
  const sectorId = useSectorStore((s) => s.sector.id);
  const { data: sectorAlerts } = useSectorAlerts(sectorId);
  const readIds = useActivityReadStore((s) => s.readIds);
  const markRead = useActivityReadStore((s) => s.markRead);
  const markAllRead = useActivityReadStore((s) => s.markAllRead);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [now] = useState(() => Date.now());

  const feed = useMemo(() => {
    const ownPostTitles: Record<string, string> = {};
    for (const post of localPosts) ownPostTitles[post.id] = post.title;
    return buildActivityFeed({ outbox, contacts, ownPostTitles, sectorAlerts: sectorAlerts ?? [] });
  }, [outbox, contacts, localPosts, sectorAlerts]);

  const visible = filterFeed(feed, filter);
  const unreadIds = feed.filter((e) => !readIds[e.id]).map((e) => e.id);

  const open = (entry: ActivityEntry) => {
    markRead(entry.id);
    const t = entry.target;
    if (t.kind === 'post' && t.id) router.push({ pathname: '/publicacion/[id]', params: { id: t.id } });
    else if (t.kind === 'report' && t.id) router.push({ pathname: '/emergencias/estado/[id]', params: { id: t.id } });
    else if (t.kind === 'board') router.push('/emergencias/tablero');
    else if (t.kind === 'emergency') router.push('/emergencias');
  };

  return (
    <Screen noTopInset>
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1">
          <Text variant="headline-lg" accessibilityRole="header">
            Actividad
          </Text>
          <Text variant="label-md" tone="muted">
            {unreadIds.length === 0 ? 'Todo al día' : `${unreadIds.length} sin leer`} · solo en este teléfono
          </Text>
        </View>
        {unreadIds.length > 0 ? (
          <Button label="Marcar leído" variant="ghost" icon="check-all" fullWidth={false} onPress={() => markAllRead(unreadIds)} />
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2" accessibilityRole="radiogroup">
        {ACTIVITY_FILTERS.map((f) => (
          <Chip key={f.id} label={f.label} role="radio" selected={filter === f.id} onPress={() => setFilter(f.id)} />
        ))}
      </ScrollView>

      {filter === 'messages' ? (
        <Card tone="low">
          <View className="flex-row items-center gap-2">
            <Icon name="message-off-outline" size={22} color="onSurfaceVariant" />
            <Text variant="body-lg-bold">Aún no hay mensajes</Text>
          </View>
          <Text tone="muted">
            El chat todavía no existe: se abrirá cuando haya conexión con un servidor. Tus solicitudes de
            contacto están guardadas en «Solicitudes».
          </Text>
          <Button label="Ver solicitudes" variant="tonal" onPress={() => setFilter('requests')} />
        </Card>
      ) : visible.length === 0 ? (
        <Card tone="low">
          <Text variant="body-lg-bold">Nada por aquí todavía</Text>
          <Text tone="muted">Cuando publiques, pidas contacto o envíes un reporte, aparecerá en esta lista.</Text>
        </Card>
      ) : (
        <View className="gap-2">
          {visible.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} unread={!readIds[entry.id]} now={now} onPress={() => open(entry)} />
          ))}
        </View>
      )}
    </Screen>
  );
}
