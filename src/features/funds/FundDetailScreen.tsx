import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useRegistrationGate } from '@/features/session';
import { formatPercent, formatSoles } from '@/shared/format';
import { Badge, Button, Card, DemoTag, Icon, ListenButton, Screen, ScreenHeader, Text } from '@/shared/ui';

import { FundProgressBar } from './FundProgressBar';
import { useFund } from './hooks';
import { fundProgress } from './progress';
import { useContributionsStore } from './store';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1">
      <Text variant="headline-sm">{value}</Text>
      <Text variant="label-md" tone="muted">
        {label}
      </Text>
    </View>
  );
}

/** Detalle de un fondo: avance, para qué es, rendición de cuentas y el botón para aportar. */
export function FundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const fundId = String(id ?? '');
  const router = useRouter();
  const { fund, now, isLoading } = useFund(fundId);
  const contributions = useContributionsStore((s) => s.contributions);
  const { requireRegistration, sheet } = useRegistrationGate();

  const p = fund ? fundProgress(fund, contributions, now) : null;
  const mine = contributions.filter((c) => c.fundId === fundId);

  const onContribute = () =>
    requireRegistration('Para aportar a un fondo, crea tu cuenta vecinal.', () =>
      router.push({ pathname: '/fondos/aportar/[id]', params: { id: fundId } }),
    );

  const summary =
    fund && p
      ? fund.goalCents && p.pct != null
        ? `${formatSoles(p.raisedCents)} de ${formatSoles(fund.goalCents)}, ${formatPercent(p.pct)}`
        : `${formatSoles(p.raisedCents)} reunidos`
      : '';

  return (
    <Screen
      header={<ScreenHeader title="Fondo vecinal" backLabel="Volver" />}
      safeBottom
      footer={
        fund ? <Button label="Aportar" size="lg" icon="hand-heart-outline" onPress={onContribute} /> : undefined
      }>
      {isLoading ? (
        <View className="items-center py-10" accessibilityLabel="Cargando el fondo">
          <ActivityIndicator />
        </View>
      ) : !fund || !p ? (
        <Card>
          <Text variant="headline-sm">No encontramos este fondo</Text>
          <Text tone="muted">Puede haberse cerrado. Vuelve a Comunidad para ver otros.</Text>
        </Card>
      ) : (
        <>
          <View className="flex-row flex-wrap items-center gap-2">
            <Badge
              label={fund.kind === 'animal' ? 'Fondo permanente' : 'Iniciativa'}
              tone="primary"
              icon={fund.kind === 'animal' ? 'paw' : 'piggy-bank-outline'}
            />
            {fund.isDemo ? <DemoTag /> : null}
          </View>

          <Text variant="headline-lg">{fund.title}</Text>
          <View className="flex-row items-center gap-1.5">
            <Icon name="check-decagram-outline" size={18} color="primary" />
            <Text variant="label-md" tone="primary" className="flex-1">
              Organiza: {fund.organizer}
            </Text>
          </View>

          <Card>
            <View className="flex-row flex-wrap items-baseline gap-2">
              <Text variant="display">{formatSoles(p.raisedCents)}</Text>
              {fund.goalCents ? (
                <Text variant="body-md-medium" tone="muted">
                  de {formatSoles(fund.goalCents)}
                </Text>
              ) : (
                <Text variant="body-md-medium" tone="muted">
                  reunidos
                </Text>
              )}
              {p.pct != null ? (
                <Text variant="headline-sm" tone="primary" className="ml-auto">
                  {formatPercent(p.pct)}
                </Text>
              ) : null}
            </View>
            {p.pct != null ? <FundProgressBar pct={p.pct} label={summary} thick /> : null}
            <View className="flex-row gap-2">
              <Stat value={String(p.contributors)} label="vecinos aportaron" />
              {p.remainingCents != null ? <Stat value={formatSoles(p.remainingCents)} label="faltan" /> : null}
              {p.daysLeft != null ? (
                <Stat value={p.daysLeft === 0 ? 'Hoy' : `${p.daysLeft} ${p.daysLeft === 1 ? 'día' : 'días'}`} label="para cerrar" />
              ) : null}
            </View>
            {mine.length > 0 ? (
              <View className="flex-row items-center gap-1.5">
                <Icon name="check-circle" size={18} color="success" />
                <Text variant="label-md" tone="success" className="flex-1">
                  Aportaste {formatSoles(mine.reduce((s, c) => s + c.amountCents, 0))} desde este teléfono
                </Text>
              </View>
            ) : null}
          </Card>

          <View className="gap-1.5">
            <Text variant="headline-sm">Para qué es</Text>
            <Text tone="muted">{fund.description}</Text>
            <ListenButton text={`${fund.title}. ${fund.description} Organiza: ${fund.organizer}. ${summary}.`} />
          </View>

          <View className="gap-2">
            <Text variant="headline-sm">Rendición de cuentas</Text>
            {fund.expenses.length === 0 ? (
              <Text tone="muted">Todavía no hay gastos. Cada compra se publicará aquí con su boleta.</Text>
            ) : (
              fund.expenses.map((e) => (
                <View key={e.id} className="flex-row items-center gap-3 rounded-2xl bg-surface-container-lowest p-3">
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-success-container">
                    <Icon name="receipt-text-check-outline" size={22} color="success" />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text variant="body-lg-bold">
                      {e.label} · {formatSoles(e.amountCents)}
                    </Text>
                    <Text variant="label-md" tone={e.hasReceipt ? 'success' : 'warning'}>
                      {e.hasReceipt ? 'Comprado · boleta adjunta' : 'Boleta pendiente'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <Card tone="low" className="flex-row items-start gap-2.5">
            <Icon name="lock-outline" size={20} color="primary" />
            <Text variant="body-md" tone="muted" className="flex-1">
              Yunta no guarda dinero. Tu aporte va de la pasarela de pago a la cuenta de quien organiza, y cada gasto se
              publica con su boleta.
            </Text>
          </Card>
        </>
      )}
      {sheet}
    </Screen>
  );
}
