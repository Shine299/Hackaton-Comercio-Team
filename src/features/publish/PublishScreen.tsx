import { zodResolver } from '@hookform/resolvers/zod';
import * as Crypto from 'expo-crypto';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { useOutboxStore } from '@/features/outbox';
import {
  getCategory,
  HELP_CATEGORIES,
  POST_KIND_LABEL,
  useLocalPostsStore,
  type Post,
  type PostDetail,
} from '@/features/posts';
import { useRegistrationGate, useSessionStore } from '@/features/session';
import { useSectorStore } from '@/features/sector';
import { Badge, Button, Card, Chip, cn, DemoTag, Icon, Screen, SyncStatusBadge, Text, TextField } from '@/shared/ui';

import { usePublishDraftStore } from './draftStore';
import { EMPTY_PUBLISH, publishSchema, step2Fields, type PublishFormValues } from './schema';
import { CATEGORY_GUIDE, EXPIRY_OPTIONS, PRICE_CHIPS } from './templates';

type Step = 1 | 2 | 3;

function toFormValues(state: PublishFormValues): PublishFormValues {
  return {
    kind: state.kind,
    category: state.category,
    title: state.title ?? '',
    description: state.description ?? '',
    extra1: state.extra1 ?? '',
    extra2: state.extra2 ?? '',
    priceLabel: state.priceLabel ?? '',
    urgent: Boolean(state.urgent),
    availableNow: state.availableNow !== false,
    photoUri: state.photoUri ?? '',
    voiceUsed: Boolean(state.voiceUsed),
    expiryDays: state.expiryDays || 7,
  };
}

function buildOwnPost(
  values: PublishFormValues,
  author: { displayName: string; deviceId: string; sectorId: string },
): Post {
  const now = Date.now();
  const guide = CATEGORY_GUIDE[values.category];
  const details: PostDetail[] = [];
  if (values.extra1.trim()) details.push({ label: guide.extra1.label.replace(' (opcional)', ''), value: values.extra1.trim() });
  if (values.extra2.trim()) details.push({ label: guide.extra2.label.replace(' (opcional)', ''), value: values.extra2.trim() });

  return {
    id: Crypto.randomUUID(),
    kind: values.kind,
    category: values.category,
    title: values.title.trim(),
    description: values.description.trim(),
    author: {
      id: author.deviceId,
      displayName: author.displayName,
      trust: 'new',
      recommendations: 0,
    },
    sectorId: author.sectorId,
    distanceM: 0,
    createdAt: now,
    expiresAt: now + values.expiryDays * 24 * 60 * 60 * 1000,
    status: 'active',
    priceLabel: values.priceLabel.trim() || undefined,
    urgent: values.kind === 'request' ? values.urgent : false,
    availableNow: values.availableNow,
    details: details.length ? details : undefined,
    photoUri: values.photoUri || undefined,
    isOwn: true,
    syncStatus: 'local',
    isDemo: false,
  };
}

function Steps({ step }: { step: Step }) {
  const items: { n: Step; label: string }[] = [
    { n: 1, label: 'Tipo' },
    { n: 2, label: 'Detalles' },
    { n: 3, label: 'Confirmar' },
  ];
  return (
    <View className="flex-row gap-2" accessibilityRole="text" accessibilityLabel={`Paso ${step} de 3`}>
      {items.map((item) => (
        <View key={item.n} className="flex-1 items-center gap-1">
          <View className={cn('h-1.5 w-full rounded-full', item.n <= step ? 'bg-primary' : 'bg-surface-container')} />
          <Text variant="label-sm" tone={item.n === step ? 'primary' : 'muted'}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Publicar en tres pasos: tipo → tarjeta guiada → confirmar. Borrador local, sincr. honesta. */
export function PublishScreen() {
  const router = useRouter();
  const { requireRegistration, sheet } = useRegistrationGate();
  const sector = useSectorStore((s) => s.sector);
  const displayName = useSessionStore((s) => s.displayName);
  const deviceId = useSessionStore((s) => s.deviceId);
  const addPost = useLocalPostsStore((s) => s.add);
  const enqueue = useOutboxStore((s) => s.enqueue);
  const saveDraft = usePublishDraftStore((s) => s.save);
  const clearDraft = usePublishDraftStore((s) => s.clear);
  const [step, setStep] = useState<Step>(1);
  const [photoHint, setPhotoHint] = useState<string | undefined>();
  const ready = useRef(false);

  const form = useForm<PublishFormValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: EMPTY_PUBLISH,
    mode: 'onBlur',
  });
  const { control, handleSubmit, setValue, getValues, reset, trigger, formState } = form;
  const kind = useWatch({ control, name: 'kind' });
  const category = useWatch({ control, name: 'category' });
  const title = useWatch({ control, name: 'title' });
  const photoUri = useWatch({ control, name: 'photoUri' });
  const voiceUsed = useWatch({ control, name: 'voiceUsed' });
  const expiryDays = useWatch({ control, name: 'expiryDays' });
  const availableNow = useWatch({ control, name: 'availableNow' });
  const urgent = useWatch({ control, name: 'urgent' });
  const priceLabel = useWatch({ control, name: 'priceLabel' });
  const description = useWatch({ control, name: 'description' });

  useEffect(() => {
    const apply = () => {
      const draft = usePublishDraftStore.getState();
      reset(toFormValues(draft));
      ready.current = true;
    };
    if (usePublishDraftStore.persist.hasHydrated()) apply();
    return usePublishDraftStore.persist.onFinishHydration(apply);
  }, [reset]);

  const persistNow = (patch?: Partial<PublishFormValues>) => {
    if (patch) {
      for (const [key, value] of Object.entries(patch)) {
        setValue(key as keyof PublishFormValues, value as never);
      }
    }
    if (ready.current) saveDraft({ ...getValues(), ...patch });
  };

  const pickKind = (next: PublishFormValues['kind']) => {
    requireRegistration('Para publicar, crea tu cuenta vecinal. Solo pedimos un nombre público y tu consentimiento.', () => {
      persistNow({ kind: next });
      setStep(2);
    });
  };

  const goStep2 = async () => {
    const ok = await trigger([...step2Fields]);
    if (!ok) return;
    persistNow();
    setStep(3);
  };

  const pickPhoto = async () => {
    setPhotoHint(undefined);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPhotoHint('Sin acceso a la galería. Puedes publicar sin foto: no es indispensable.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      exif: false,
      allowsEditing: false,
    });
    if (result.canceled) return;
    const uri = result.assets[0]?.uri;
    if (uri) persistNow({ photoUri: uri });
  };

  const applyVoiceMock = () => {
    if (!category) return;
    const mock = CATEGORY_GUIDE[category].voice;
    persistNow({ description: mock, voiceUsed: true });
  };

  const applyTemplate = (template: { title: string; description: string }) => {
    persistNow({ title: template.title, description: template.description });
  };

  const onPublish = () => {
    void handleSubmit((values) => {
      const post = buildOwnPost(values, { displayName, deviceId, sectorId: sector.id });
      addPost(post);
      enqueue('post.create', { postId: post.id }, values.urgent ? 'urgent' : 'normal');
      clearDraft();
      reset(EMPTY_PUBLISH);
      setStep(1);
      router.push({ pathname: '/publicacion/[id]', params: { id: post.id } });
    })();
  };

  const guide = category ? CATEGORY_GUIDE[category] : undefined;
  const hasDraft = Boolean(kind || category || title?.trim());

  return (
    <Screen
      noTopInset
      footer={
        step === 1 ? undefined : (
          <View className="gap-2">
            <Button
              label={step === 2 ? 'Continuar' : 'Publicar en mi teléfono'}
              size="lg"
              icon={step === 2 ? 'arrow-right' : 'check'}
              onPress={step === 2 ? () => void goStep2() : onPublish}
            />
            <Button
              label="Atrás"
              variant="ghost"
              onPress={() => {
                persistNow();
                setStep((s) => (s === 3 ? 2 : 1));
              }}
            />
          </View>
        )
      }>
      <Steps step={step} />

      {step === 1 ? (
        <>
          <View className="gap-1">
            <Text variant="headline-lg">¿Ofreces o solicitas?</Text>
            <Text tone="muted">
              Tres pasos. Lo único indispensable es un título claro. Foto, voz y extras son opcionales.
            </Text>
          </View>

          {hasDraft ? (
            <Card tone="low">
              <Text variant="body-md-medium">Tienes un borrador guardado en tu teléfono</Text>
              <Text tone="muted" numberOfLines={2}>
                {title?.trim() || 'Sin título todavía'}
              </Text>
              <Button
                label="Continuar borrador"
                variant="tonal"
                onPress={() =>
                  requireRegistration('Para publicar, crea tu cuenta vecinal.', () => setStep(kind && category && title ? 3 : 2))
                }
              />
              <Button
                label="Empezar de cero"
                variant="ghost"
                onPress={() => {
                  clearDraft();
                  reset(EMPTY_PUBLISH);
                }}
              />
            </Card>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ofrecer ayuda o un recurso"
            onPress={() => pickKind('offer')}
            className="min-h-32 justify-center gap-2 rounded-2xl bg-primary-fixed p-5 active:opacity-80">
            <Icon name="gift-outline" size={32} color="primary" />
            <Text variant="headline-md" tone="primary">
              Ofrezco
            </Text>
            <Text>Presto, regalo, hago un trueque o doy una mano.</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Solicitar ayuda o un recurso"
            onPress={() => pickKind('request')}
            className="min-h-32 justify-center gap-2 rounded-2xl bg-secondary-fixed p-5 active:opacity-80">
            <Icon name="hand-extended-outline" size={32} color="secondary" />
            <Text variant="headline-md" tone="secondary">
              Solicito
            </Text>
            <Text>Pido un préstamo, un objeto o apoyo de un vecino.</Text>
          </Pressable>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <View className="gap-1">
            <Text variant="headline-lg">
              {kind === 'offer' ? 'Qué ofreces' : 'Qué necesitas'}
            </Text>
            <Text tone="muted">Elige categoría, usa una plantilla si te sirve y edita siempre el texto.</Text>
            <Text variant="label-md" tone="muted">
              Borrador guardado en tu teléfono
            </Text>
          </View>

          <View className="gap-2">
            <Text variant="label-md" tone="muted">
              Categoría
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {HELP_CATEGORIES.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  role="radio"
                  selected={category === item.id}
                  onPress={() => persistNow({ category: item.id })}
                />
              ))}
            </View>
            {formState.errors.category?.message ? (
              <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
                {formState.errors.category.message}
              </Text>
            ) : null}
          </View>

          {guide && kind ? (
            <View className="gap-2">
              <Text variant="label-md" tone="muted">
                Plantillas (opcionales, siempre editables)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {guide.templates[kind].map((template) => (
                  <Chip
                    key={template.title}
                    label={template.title}
                    role="radio"
                    selected={title === template.title}
                    onPress={() => applyTemplate(template)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Título"
                hint="Es lo único indispensable. Frase corta que un vecino entienda de un vistazo."
                placeholder="Ejemplo: Presto mi escalera por unas horas"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  if (ready.current) saveDraft({ ...getValues(), title: text });
                }}
                onBlur={() => {
                  onBlur();
                  persistNow();
                }}
                error={formState.errors.title?.message}
                maxLength={80}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Descripción (opcional)"
                hint="Sin dirección exacta ni datos médicos."
                placeholder="Cómo coordinar, cuándo y en qué condiciones."
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  if (ready.current) saveDraft({ ...getValues(), description: text });
                }}
                onBlur={() => {
                  onBlur();
                  persistNow();
                }}
                error={formState.errors.description?.message}
                multiline
                maxLength={500}
              />
            )}
          />

          {voiceUsed ? <DemoTag label="Transcripción simulada" /> : null}

          <Button label="Añadir foto (opcional)" variant="outline" icon="image-plus-outline" onPress={pickPhoto} />
          <Button
            label="Dictar por voz (simulado)"
            variant="outline"
            icon="microphone-outline"
            disabled={!category}
            onPress={applyVoiceMock}
          />
          {photoHint ? (
            <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
              {photoHint}
            </Text>
          ) : (
            <Text variant="label-sm" tone="muted">
              Foto y voz son opcionales. La voz de esta demo pega un texto de ejemplo: no graba audio.
            </Text>
          )}

          {photoUri ? (
            <View className="gap-2">
              <Image
                source={{ uri: photoUri }}
                style={{ width: '100%', height: 160, borderRadius: 16 }}
                contentFit="cover"
                accessibilityLabel="Foto elegida para la publicación"
              />
              <Button label="Quitar foto" variant="ghost" onPress={() => persistNow({ photoUri: '' })} />
            </View>
          ) : null}

          {guide ? (
            <>
              <Controller
                control={control}
                name="extra1"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    label={guide.extra1.label}
                    placeholder={guide.extra1.placeholder}
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                      onBlur();
                      persistNow();
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="extra2"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    label={guide.extra2.label}
                    placeholder={guide.extra2.placeholder}
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                      onBlur();
                      persistNow();
                    }}
                  />
                )}
              />
            </>
          ) : null}

          <View className="gap-2">
            <Text variant="label-md" tone="muted">
              Precio o condición (opcional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {PRICE_CHIPS.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  role="radio"
                  selected={priceLabel === label}
                  onPress={() => persistNow({ priceLabel: label })}
                />
              ))}
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <Chip
              label="Disponible ahora"
              icon="flash-outline"
              selected={availableNow}
              onPress={() => persistNow({ availableNow: !availableNow })}
            />
            {kind === 'request' ? (
              <Chip
                label="Es urgente (sin validar)"
                icon="alert-outline"
                selected={urgent}
                onPress={() => persistNow({ urgent: !urgent })}
              />
            ) : null}
          </View>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <View className="gap-1">
            <Text variant="headline-lg">Revisa y publica</Text>
            <Text tone="muted">
              Se guarda en tu teléfono. Aún no hay servidor: no se enviará a nadie ni aparecerá como recibida.
            </Text>
          </View>

          <Card>
            <View className="flex-row flex-wrap gap-2">
              <Badge
                label={kind ? POST_KIND_LABEL[kind] : ''}
                tone={kind === 'offer' ? 'primary' : 'secondary'}
              />
              {category ? <Badge label={getCategory(category).label} /> : null}
              {urgent && kind === 'request' ? <Badge label="Urgente · sin validar" tone="error" /> : null}
            </View>
            <Text variant="headline-sm">{title?.trim()}</Text>
            {description?.trim() ? <Text tone="muted">{description.trim()}</Text> : null}
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{ width: '100%', height: 140, borderRadius: 12 }}
                contentFit="cover"
                accessibilityLabel="Foto de la publicación"
              />
            ) : null}
            <Text variant="label-md" tone="muted">
              {sector.name} · {displayName} · Nuevo en la red
            </Text>
            <SyncStatusBadge status="local" />
            {voiceUsed ? <DemoTag label="Incluye transcripción simulada" /> : null}
          </Card>

          <View className="gap-2">
            <Text variant="label-md" tone="muted">
              Vigencia
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {EXPIRY_OPTIONS.map((option) => (
                <Chip
                  key={option.days}
                  label={option.label}
                  role="radio"
                  selected={expiryDays === option.days}
                  onPress={() => persistNow({ expiryDays: option.days })}
                />
              ))}
            </View>
          </View>
        </>
      ) : null}

      {sheet}
    </Screen>
  );
}
