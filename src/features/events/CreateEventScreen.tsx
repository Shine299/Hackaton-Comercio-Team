import { zodResolver } from '@hookform/resolvers/zod';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, ScrollView, View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { useRegistrationGate, useSessionStore } from '@/features/session';
import { isSupabaseConfigured } from '@/shared/supabase/client';
import { Button, Chip, cn, Icon, type IconName, Screen, ScreenHeader, Text, TextField } from '@/shared/ui';

import { useEventsLocalStore } from './localStore';
import { startsAtFrom } from './logic';
import { createEventSchema, type CreateEventValues, EVENT_HOURS } from './schema';

const DAY_CHOICES = 14;
const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function dayLabel(offset: number, now: number): string {
  if (offset === 0) return 'Hoy';
  if (offset === 1) return 'Mañana';
  const d = new Date(startsAtFrom(offset, 12, now));
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}`;
}

const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'a. m.' : 'p. m.'}`;

function VenueOption({
  selected,
  icon,
  title,
  detail,
  onPress,
}: {
  selected: boolean;
  icon: IconName;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${detail}`}
      onPress={onPress}
      className={cn(
        'min-h-16 flex-row items-center gap-3 rounded-2xl border-2 p-4 active:opacity-80',
        selected ? 'border-primary bg-primary-fixed' : 'border-outline-variant bg-surface-container-lowest',
      )}>
      <Icon name={icon} size={28} color="primary" />
      <View className="min-w-0 flex-1">
        <Text variant="body-lg-bold">{title}</Text>
        <Text variant="label-md" tone="muted">
          {detail}
        </Text>
      </View>
      {selected ? <Icon name="check-circle" size={24} color="primary" /> : null}
    </Pressable>
  );
}

/**
 * Crear evento (SPEC-046), en 2 pasos: qué es, y cuándo y dónde. Día y hora con botones grandes (sin calendario
 * pequeño). Queda «Guardado en tu teléfono» y sale por la cola de envío.
 */
export function CreateEventScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const displayName = useSessionStore((s) => s.displayName);
  const createEvent = useEventsLocalStore((s) => s.create);
  const { requireRegistration, sheet } = useRegistrationGate();
  const [step, setStep] = useState<1 | 2>(1);
  const [now] = useState(() => Date.now());
  const schema = useMemo(() => createEventSchema(now), [now]);

  const { control, handleSubmit, trigger, setValue, formState } = useForm<CreateEventValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', body: '', dayOffset: 1, hour: 17, venueKind: 'public_place', venueName: '' },
    mode: 'onBlur',
  });
  const dayOffset = useWatch({ control, name: 'dayOffset' });
  const hour = useWatch({ control, name: 'hour' });
  const venueKind = useWatch({ control, name: 'venueKind' });
  const errors = formState.errors;

  const goStep2 = async () => {
    if (await trigger(['title', 'body'])) setStep(2);
  };

  const onCreate = handleSubmit((values) =>
    requireRegistration('Para crear un evento, crea tu cuenta vecinal (solo un nombre público).', () => {
      const id = Crypto.randomUUID();
      createEvent(
        {
          id,
          sectorId: sector.id,
          title: values.title.trim(),
          body: values.body.trim(),
          startsAt: startsAtFrom(values.dayOffset, values.hour, now),
          venueKind: values.venueKind,
          venueName: values.venueName.trim(),
          organizerName: useSessionStore.getState().displayName || displayName || 'Vecino',
        },
        { server: isSupabaseConfigured },
      );
      router.replace({ pathname: '/evento/[id]', params: { id } });
    }),
  );

  return (
    <Screen
      header={<ScreenHeader title="Crear evento" backLabel="Volver a Eventos" />}
      safeBottom
      footer={
        <View className="gap-2">
          <Button
            label={step === 1 ? 'Continuar' : 'Crear evento'}
            size="lg"
            icon={step === 1 ? 'arrow-right' : 'check'}
            onPress={step === 1 ? () => void goStep2() : () => void onCreate()}
          />
          {step === 2 ? <Button label="Atrás" variant="ghost" onPress={() => setStep(1)} /> : null}
        </View>
      }>
      <Text variant="label-md" tone="muted" accessibilityRole="text">
        Paso {step} de 2
      </Text>

      {step === 1 ? (
        <>
          <View className="gap-1">
            <Text variant="headline-lg" accessibilityRole="header">
              ¿Qué quieres organizar?
            </Text>
            <Text tone="muted">Una charla, una feria, un lonche, una jornada de limpieza…</Text>
          </View>
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Título"
                placeholder="Ejemplo: Feria de la cuadra"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                maxLength={120}
              />
            )}
          />
          <Controller
            control={control}
            name="body"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Descripción (opcional)"
                hint="Qué traer, para quién es, si tiene costo."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.body?.message}
                multiline
                maxLength={400}
              />
            )}
          />
        </>
      ) : (
        <>
          <View className="gap-1">
            <Text variant="headline-lg" accessibilityRole="header">
              ¿Cuándo y dónde?
            </Text>
            <Text tone="muted">Puedes cambiar de idea: nada sale hasta que toques «Crear evento».</Text>
          </View>

          <View className="gap-2">
            <Text variant="body-md-medium">Día</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4">
              {Array.from({ length: DAY_CHOICES }, (_, offset) => (
                <Chip
                  key={offset}
                  role="radio"
                  label={dayLabel(offset, now)}
                  selected={dayOffset === offset}
                  onPress={() => setValue('dayOffset', offset, { shouldValidate: true })}
                />
              ))}
            </ScrollView>
          </View>

          <View className="gap-2">
            <Text variant="body-md-medium">Hora</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4">
              {EVENT_HOURS.map((h) => (
                <Chip
                  key={h}
                  role="radio"
                  label={hourLabel(h)}
                  selected={hour === h}
                  onPress={() => setValue('hour', h, { shouldValidate: true })}
                />
              ))}
            </ScrollView>
            {errors.hour?.message ? (
              <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
                {errors.hour.message}
              </Text>
            ) : null}
          </View>

          <View className="gap-2" accessibilityRole="radiogroup">
            <Text variant="body-md-medium">Lugar</Text>
            <VenueOption
              selected={venueKind === 'public_place'}
              icon="map-marker-radius-outline"
              title="Lugar público"
              detail="Parque, local comunal, bodega… Se muestra su nombre."
              onPress={() => setValue('venueKind', 'public_place')}
            />
            <VenueOption
              selected={venueKind === 'approx_zone'}
              icon="home-outline"
              title="En una casa"
              detail="Solo se muestra una zona aproximada."
              onPress={() => setValue('venueKind', 'approx_zone')}
            />
          </View>

          <Controller
            control={control}
            name="venueName"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label={venueKind === 'approx_zone' ? 'Zona aproximada' : 'Nombre del lugar'}
                hint={
                  venueKind === 'approx_zone'
                    ? 'Ejemplo: «Cuadra 5 de Arequipa». No pongas el número de la casa.'
                    : `Ejemplo: «Parque de ${sector.name}»`
                }
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.venueName?.message}
                maxLength={80}
              />
            )}
          />
        </>
      )}
      {sheet}
    </Screen>
  );
}
