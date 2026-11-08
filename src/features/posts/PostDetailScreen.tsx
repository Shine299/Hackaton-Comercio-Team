import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useOutboxStore } from '@/features/outbox';
import { useRegistrationGate } from '@/features/session';
import { formatApproxDistance, formatExpiry, formatRelativeTime } from '@/shared/format';
import {
  Badge,
  Button,
  Card,
  DemoTag,
  Icon,
  Screen,
  ScreenHeader,
  SyncStatusBadge,
  Text,
} from '@/shared/ui';

import { getCategory, POST_KIND_LABEL, TRUST_LABEL } from './categories';
import { ContactRequestSheet } from './components/ContactRequestSheet';
import { ReportSheet } from './components/ReportSheet';
import { useContactStore } from './contactStore';
import { useInterestStore } from './interestStore';
import { usePost } from './hooks';
import { useLocalPostsStore } from './localStore';
import { useReportStore } from './reportStore';
import { useSavedStore } from './savedStore';
import { POST_STATUS_LABEL } from './status';
import type { Post, PostStatus, TrustLevel } from './types';

const trustIcon = {
  new: 'sprout-outline',
  verified: 'check-decagram-outline',
  endorsed: 'shield-check-outline',
} as const satisfies Record<TrustLevel, string>;

function effectiveStatus(post: Post, now: number): PostStatus {
  if (post.expiresAt <= now && (post.status === 'active' || post.status === 'paused')) return 'expired';
  return post.status;
}

/** Detalle: autor, vigencia, campos de categoría, guardar, solicitud de contacto y reporte. */
export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const postId = String(id ?? '');
  const { data, isLoading } = usePost(postId);
  const post = data?.post;
  const now = data?.fetchedAt ?? 0;
  const { requireRegistration, sheet } = useRegistrationGate();
  const saved = useSavedStore((s) => s.postIds.includes(postId));
  const toggleSaved = useSavedStore((s) => s.toggle);
  const savedProfiles = useSavedStore((s) => s.profileIds);
  const toggleProfile = useSavedStore((s) => s.toggleProfile);
  const request = useContactStore((s) => s.requests.find((item) => item.postId === postId));
  const addRequest = useContactStore((s) => s.add);
  const reported = useReportStore((s) => s.reports.some((item) => item.postId === postId));
  const addReport = useReportStore((s) => s.add);
  const updateOwn = useLocalPostsStore((s) => s.update);
  const enqueue = useOutboxStore((s) => s.enqueue);
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const recordView = useInterestStore((s) => s.recordView);
  useEffect(() => {
    if (post) recordView(post);
  }, [post?.id, recordView]); // eslint-disable-line react-hooks/exhaustive-deps

  const status = post ? effectiveStatus(post, now) : 'active';
  const canContact = Boolean(post && !post.isOwn && status === 'active');
  const category = post ? getCategory(post.category) : null;
  const isOffer = post?.kind === 'offer';
  const isBusiness = post?.category === 'business';

  const onSave = () => {
    if (saved) {
      toggleSaved(postId);
      return;
    }
    requireRegistration('Para guardar una publicación, crea tu cuenta vecinal (solo un nombre público).', () =>
      toggleSaved(postId),
    );
  };

  const onContact = () => {
    if (request) return;
    requireRegistration('Para pedir contacto, crea tu cuenta vecinal. No pedimos teléfono ni dirección.', () =>
      setContactOpen(true),
    );
  };

  const onReport = () => {
    if (reported) return;
    requireRegistration('Para reportar, crea tu cuenta vecinal.', () => setReportOpen(true));
  };

  return (
    <Screen
      header={
        <ScreenHeader
          title={post?.category === 'business' ? 'Emprendimiento' : 'Publicación'}
          backLabel="Volver a la lista"
          trailing={
            post ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar publicación'}
                onPress={onSave}
                className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-container">
                <Icon name={saved ? 'bookmark' : 'bookmark-outline'} size={24} color="primary" />
              </Pressable>
            ) : undefined
          }
        />
      }
      safeBottom
      footer={
        canContact ? (
          <Button
            label={
              request
                ? 'Solicitud guardada en tu teléfono'
                : isBusiness
                  ? 'Enviar solicitud al negocio'
                  : isOffer
                    ? 'Pedir contacto'
                    : 'Ofrecer ayuda'
            }
            size="lg"
            icon={request ? 'cellphone-check' : 'message-text-outline'}
            disabled={Boolean(request)}
            onPress={onContact}
          />
        ) : undefined
      }>
      {isLoading ? (
        <View className="items-center py-10">
          <ActivityIndicator />
        </View>
      ) : !post || !category ? (
        <Card>
          <Text variant="headline-sm">No encontramos esta publicación</Text>
          <Text tone="muted">Puede haber vencido o haberse cerrado. Vuelve a la lista para ver otras.</Text>
        </Card>
      ) : (
        <>
          <View className="flex-row flex-wrap items-center gap-2">
            <Badge
              label={POST_KIND_LABEL[post.kind]}
              tone={isOffer ? 'primary' : 'secondary'}
              icon={isOffer ? 'gift-outline' : 'hand-extended-outline'}
            />
            <Badge label={category.label} tone="neutral" icon={category.icon} />
            <Badge label={POST_STATUS_LABEL[status]} tone={status === 'expired' || status === 'closed' ? 'warning' : 'success'} />
            {post.urgent ? <Badge label="Urgente · sin validar" tone="error" icon="alert-outline" /> : null}
            {post.isOwn && post.syncStatus ? <SyncStatusBadge status={post.syncStatus} /> : null}
            {post.isDemo ? <DemoTag /> : null}
          </View>

          <Text variant="headline-lg">{post.title}</Text>

          {post.photoUri ? (
            <Image
              source={{ uri: post.photoUri }}
              style={{ width: '100%', height: 200, borderRadius: 16 }}
              contentFit="cover"
              accessibilityLabel="Fotografía de la publicación"
            />
          ) : null}

          {post.description ? <Text>{post.description}</Text> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver perfil de ${post.author.displayName}`}
            onPress={() => router.push({ pathname: '/vecino/[id]', params: { id: post.author.id } })}>
            <Card>
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-fixed">
                  <Text variant="body-lg-bold" tone="primary">
                    {post.author.displayName.charAt(0)}
                  </Text>
                </View>
                <View className="min-w-0 flex-1">
                  <Text variant="body-md-medium">{post.author.displayName}</Text>
                  <View className="flex-row items-center gap-1">
                    <Icon name={trustIcon[post.author.trust]} size={16} color="onSurfaceVariant" />
                    <Text variant="label-md" tone="muted">
                      {TRUST_LABEL[post.author.trust]}
                      {post.author.recommendations > 0 ? ` · ${post.author.recommendations} recom.` : ''}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={22} color="onSurfaceVariant" />
              </View>
            </Card>
          </Pressable>
          {!post.isOwn ? (
            <Button
              label={savedProfiles.includes(post.author.id) ? 'Perfil guardado' : 'Guardar perfil'}
              variant="outline"
              icon={savedProfiles.includes(post.author.id) ? 'bookmark' : 'bookmark-outline'}
              onPress={() => {
                const authorId = post.author.id;
                if (savedProfiles.includes(authorId)) toggleProfile(authorId);
                else
                  requireRegistration('Para guardar un perfil, crea tu cuenta vecinal (solo un nombre público).', () =>
                    toggleProfile(authorId),
                  );
              }}
            />
          ) : null}

          <Card>
            <View className="flex-row items-center gap-2">
              <Icon name="map-marker-outline" size={18} color="onSurfaceVariant" />
              <Text>
                {formatApproxDistance(post.distanceM)} · sector aproximado
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Icon name="clock-outline" size={18} color="onSurfaceVariant" />
              <Text>
                {formatRelativeTime(post.createdAt, now)} · {formatExpiry(post.expiresAt, now)}
              </Text>
            </View>
            {post.priceLabel ? (
              <Text variant="body-md-medium" tone="primary">
                {post.priceLabel}
              </Text>
            ) : null}
            {post.availableNow ? (
              <Text variant="label-md" tone="success">
                Disponible ahora
              </Text>
            ) : (
              <Text variant="label-md" tone="muted">
                A coordinar
              </Text>
            )}
          </Card>

          {post.details && post.details.length > 0 ? (
            <Card>
              <Text variant="overline" tone="muted">
                Detalle de {category.label}
              </Text>
              {post.details.map((item) => (
                <View key={item.label} className="gap-0.5">
                  <Text variant="label-md" tone="muted">
                    {item.label}
                  </Text>
                  <Text>{item.value}</Text>
                </View>
              ))}
            </Card>
          ) : null}

          {isBusiness && !post.isOwn ? (
            <Card tone="low" className="flex-row items-start gap-2">
              <Icon name="shield-lock-outline" size={20} color="primary" />
              <Text variant="label-md" tone="muted" className="flex-1">
                Para cuidar tu privacidad, el contacto se abre cuando el negocio acepta tu solicitud. Nunca
                mostramos su dirección exacta.
              </Text>
            </Card>
          ) : null}

          {post.isOwn ? (
            <Card tone="warning">
              <Text variant="headline-sm">Esta publicación está en tu teléfono</Text>
              <Text tone="muted">
                Aún no hay servidor: tus vecinos no la verán en otros dispositivos. Nunca aparece como
                «recibida».
              </Text>
              {post.syncStatus ? <SyncStatusBadge status={post.syncStatus} /> : null}
              <View className="gap-2">
                {post.status === 'active' ? (
                  <Button label="Pausar" variant="outline" icon="pause" onPress={() => updateOwn(post.id, { status: 'paused' })} />
                ) : null}
                {post.status === 'paused' ? (
                  <Button
                    label="Reanudar"
                    variant="outline"
                    icon="play"
                    onPress={() => updateOwn(post.id, { status: 'active' })}
                  />
                ) : null}
                {post.status === 'active' || post.status === 'paused' ? (
                  <Button
                    label="Marcar en coordinación"
                    variant="tonal"
                    icon="handshake-outline"
                    onPress={() => updateOwn(post.id, { status: 'in_coordination' })}
                  />
                ) : null}
                {post.status !== 'closed' && post.status !== 'completed' ? (
                  <Button label="Cerrar" variant="ghost" icon="check" onPress={() => updateOwn(post.id, { status: 'closed' })} />
                ) : null}
              </View>
            </Card>
          ) : null}

          {request ? (
            <Card>
              <Text variant="headline-sm">Solicitud enviada</Text>
              <Text tone="muted">«{request.message}»</Text>
              <SyncStatusBadge status={request.syncStatus} />
            </Card>
          ) : null}

          {!post.isOwn ? (
            <Button
              label={reported ? 'Ya reportaste esta publicación' : 'Reportar publicación'}
              variant="ghost"
              icon="flag-outline"
              disabled={reported}
              onPress={onReport}
            />
          ) : null}

          {saved ? (
            <Text variant="label-md" tone="muted">
              Guardada en «Todos los guardados». Las colecciones personalizadas llegan en Perfil.
            </Text>
          ) : null}
        </>
      )}

      {sheet}
      {post ? (
        <ContactRequestSheet
          visible={contactOpen}
          postTitle={post.title}
          onClose={() => setContactOpen(false)}
          onSubmit={(message) => {
            addRequest(post.id, message);
            enqueue('interaction.request', { postId: post.id, message }, post.urgent ? 'urgent' : 'normal');
            setContactOpen(false);
          }}
        />
      ) : null}
      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(reason, note) => {
          addReport(postId, reason, note);
          enqueue('moderation.report', { postId, reason, note });
        }}
      />
    </Screen>
  );
}
