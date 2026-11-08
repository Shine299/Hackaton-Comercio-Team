import * as Crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import {
  chargeWithTimeout,
  FAILURE_TEXT,
  type FailureReason,
  parseSolesInput,
  PaymentModeTag,
  paymentsProvider,
  validateYapeCharge,
} from '@/features/payments';
import { useRegistrationGate } from '@/features/session';
import { formatPercent, formatSoles } from '@/shared/format';
import { Button, Card, Chip, Icon, Screen, ScreenHeader, Text, TextField } from '@/shared/ui';

import { FundProgressBar } from './FundProgressBar';
import { useFund } from './hooks';
import { fundProgress } from './progress';
import { useContributionsStore } from './store';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

type Step = { kind: 'form' } | { kind: 'processing' } | { kind: 'confirmed'; amountCents: number } | { kind: 'failed'; reason: FailureReason };

/** Pantalla de estado (procesando / confirmado / fallido): grande, centrada y anunciada al lector. */
function StateView({ icon, tone, title, children }: { icon: 'progress-clock' | 'check-circle' | 'wifi-off'; tone: 'primary' | 'success' | 'warning'; title: string; children?: ReactNode }) {
  const bg = tone === 'success' ? 'bg-success-container' : tone === 'warning' ? 'bg-warning-container' : 'bg-primary-fixed';
  return (
    <View className="flex-1 items-center justify-center gap-3 px-4 py-10" accessibilityLiveRegion="polite">
      <View className={`h-28 w-28 items-center justify-center rounded-full ${bg}`}>
        <Icon name={icon} size={60} color={tone} />
      </View>
      <Text variant="headline-lg" className="text-center" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * Aportar a un fondo (ADR 0005): solo en línea, una llamada con clave de idempotencia, y la app nunca dice
 * «confirmado» sin la respuesta del proveedor. Sin red: «No se cobró nada».
 */
export function ContributeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const fundId = String(id ?? '');
  const router = useRouter();
  const { fund, now } = useFund(fundId);
  const contributions = useContributionsStore((s) => s.contributions);
  const addConfirmed = useContributionsStore((s) => s.addConfirmed);
  const { requireRegistration, sheet } = useRegistrationGate();

  const [quick, setQuick] = useState<number | 'other'>(2000);
  const [other, setOther] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [step, setStep] = useState<Step>({ kind: 'form' });

  const mounted = useRef(true);
  useEffect(() => () => void (mounted.current = false), []);

  const amountCents = quick === 'other' ? parseSolesInput(other) : quick;
  const problem = validateYapeCharge({ amountCents, phone, otp });

  const submit = () => {
    if (problem || amountCents == null || step.kind === 'processing') return;
    requireRegistration('Para aportar a un fondo, crea tu cuenta vecinal.', async () => {
      // Una clave nueva por intento: si la llamada se repite, el proveedor devuelve el mismo resultado.
      const idempotencyKey = Crypto.randomUUID();
      setStep({ kind: 'processing' });
      const res = await chargeWithTimeout({
        idempotencyKey,
        fundId,
        amountCents,
        method: 'yape',
        yape: { phone, otp: otp.trim() },
      });
      if (res.status === 'confirmed') {
        addConfirmed({ id: idempotencyKey, fundId, amountCents, anonymous, mode: res.mode, chargeId: res.chargeId, createdAt: Date.now() });
        setOtp('');
      }
      if (!mounted.current) return;
      setStep(res.status === 'confirmed' ? { kind: 'confirmed', amountCents } : { kind: 'failed', reason: res.reason });
    });
  };

  const header = (
    <ScreenHeader
      title="Aportar"
      backLabel="Cancelar y volver al fondo"
      trailing={<View className="pr-2"><PaymentModeTag mode={paymentsProvider.mode} /></View>}
    />
  );

  if (step.kind === 'processing') {
    return (
      <Screen header={header} scroll={false} safeBottom>
        <StateView icon="progress-clock" tone="primary" title="Procesando tu aporte…">
          <Text tone="muted" className="text-center">
            Esperando la respuesta de la pasarela. No cierres la app.
          </Text>
        </StateView>
      </Screen>
    );
  }

  if (step.kind === 'confirmed') {
    const p = fund ? fundProgress(fund, contributions, now) : null;
    return (
      <Screen header={header} safeBottom footer={<Button label="Volver al fondo" size="lg" onPress={() => router.back()} />}>
        <StateView icon="check-circle" tone="success" title="Aporte confirmado">
          <Text tone="muted" className="text-center">
            {paymentsProvider.mode === 'mock' ? 'El aporte simulado' : 'La pasarela confirmó tu aporte'} de{' '}
            {formatSoles(step.amountCents)}. ¡Gracias por sumar!
          </Text>
          <PaymentModeTag mode={paymentsProvider.mode} />
          {paymentsProvider.mode !== 'live' ? (
            <Text variant="label-md" tone="muted" className="text-center">
              No se movió dinero real.
            </Text>
          ) : null}
          {fund?.goalCents && p?.pct != null ? (
            <Card className="mt-2 self-stretch">
              <View className="flex-row justify-between">
                <Text variant="body-lg-bold">
                  {formatSoles(p.raisedCents)} de {formatSoles(fund.goalCents)}
                </Text>
                <Text variant="body-lg-bold" tone="primary">
                  {formatPercent(p.pct)}
                </Text>
              </View>
              <FundProgressBar pct={p.pct} label={`${formatSoles(p.raisedCents)} de ${formatSoles(fund.goalCents)}, ${formatPercent(p.pct)}`} />
            </Card>
          ) : null}
        </StateView>
      </Screen>
    );
  }

  if (step.kind === 'failed') {
    return (
      <Screen
        header={header}
        safeBottom
        footer={
          <View className="gap-2">
            <Button label="Intentar de nuevo" size="lg" icon="refresh" onPress={() => setStep({ kind: 'form' })} />
            <Button label="Volver al fondo" variant="outline" onPress={() => router.back()} />
          </View>
        }>
        <StateView icon="wifi-off" tone="warning" title="No se pudo procesar">
          <Text variant="headline-sm" className="text-center">
            No se cobró nada.
          </Text>
          <Text tone="muted" className="text-center">
            {FAILURE_TEXT[step.reason]}
          </Text>
        </StateView>
      </Screen>
    );
  }

  return (
    <Screen
      header={header}
      safeBottom
      footer={
        <View className="gap-1.5">
          <Button
            label={amountCents ? `Aportar ${formatSoles(amountCents)}` : 'Aportar'}
            size="lg"
            icon="lock-outline"
            disabled={Boolean(problem)}
            onPress={submit}
          />
          {problem ? (
            <Text variant="label-md" tone="muted" className="text-center" accessibilityLiveRegion="polite">
              {problem}
            </Text>
          ) : null}
        </View>
      }>
      <View className="gap-1">
        <Text variant="headline-lg">Aportar</Text>
        {fund ? (
          <Text tone="muted" numberOfLines={2}>
            {fund.title}
          </Text>
        ) : null}
      </View>

      <View className="gap-2" accessibilityRole="radiogroup" accessibilityLabel="¿Cuánto quieres aportar?">
        <Text variant="body-lg-bold">¿Cuánto quieres aportar?</Text>
        <View className="flex-row flex-wrap gap-2">
          {QUICK_AMOUNTS.map((cents) => (
            <Chip key={cents} role="radio" label={formatSoles(cents)} selected={quick === cents} onPress={() => setQuick(cents)} />
          ))}
          <Chip role="radio" label="Otro monto" selected={quick === 'other'} onPress={() => setQuick('other')} />
        </View>
        {quick === 'other' ? (
          <TextField label="Monto en soles" placeholder="Ej.: 15" keyboardType="decimal-pad" value={other} onChangeText={setOther} leadingIcon="cash" />
        ) : null}
      </View>

      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Icon name="cellphone" size={22} color="primary" />
          <Text variant="body-lg-bold">Pagas con Yape</Text>
        </View>
        <TextField
          label="Tu número de Yape"
          placeholder="987 654 321"
          keyboardType="phone-pad"
          autoComplete="tel"
          maxLength={11}
          value={phone}
          onChangeText={setPhone}
        />
        <TextField
          label="Código de aprobación"
          placeholder="6 dígitos"
          hint="Lo ves en tu app de Yape. Vence en 2 minutos."
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />
        <View className="flex-row items-center gap-1.5">
          <Icon name="lock-outline" size={16} color="onSurfaceVariant" />
          <Text variant="label-md" tone="muted" className="flex-1">
            No guardamos tu número ni el código.
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: anonymous }}
        accessibilityLabel="Aportar sin mostrar mi nombre"
        onPress={() => setAnonymous((v) => !v)}
        className="min-h-12 flex-row items-center gap-3 active:opacity-80">
        <Icon name={anonymous ? 'checkbox-marked' : 'checkbox-blank-outline'} size={26} color="primary" />
        <Text variant="body-lg" className="flex-1">
          Aportar sin mostrar mi nombre
        </Text>
      </Pressable>
      {sheet}
    </Screen>
  );
}
