import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { formatPercent, formatSoles } from '@/shared/format';
import { DemoTag, Icon, Text, PressableScale } from '@/shared/ui';

import { FundProgressBar } from './FundProgressBar';
import { fundProgress } from './progress';
import { useContributionsStore } from './store';
import type { Fund } from './types';

/** Tarjeta corta de un fondo para Comunidad: qué es, cuánto lleva y cuánto falta. */
export function FundCard({ fund, now }: { fund: Fund; now: number }) {
  const router = useRouter();
  const contributions = useContributionsStore((s) => s.contributions);
  const p = fundProgress(fund, contributions, now);

  const amount =
    fund.goalCents && p.pct != null
      ? `${formatSoles(p.raisedCents)} de ${formatSoles(fund.goalCents)} · ${formatPercent(p.pct)}`
      : `${formatSoles(p.raisedCents)} reunidos · fondo permanente`;
  const when = p.daysLeft == null ? null : p.daysLeft === 0 ? 'Cierra hoy' : `Faltan ${p.daysLeft} ${p.daysLeft === 1 ? 'día' : 'días'}`;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Fondo vecinal: ${fund.title}. ${amount}. ${p.contributors} vecinos aportaron.${when ? ` ${when}.` : ''}${fund.isDemo ? ' Dato de demostración.' : ''} Ver fondo`}
      onPress={() => router.push({ pathname: '/fondos/[id]', params: { id: fund.id } })}
      className="gap-2.5 rounded-3xl bg-surface-container-lowest p-4 shadow-sm elevation-xs">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-1.5 rounded-xl bg-primary-fixed px-2.5 py-1">
          <Icon name={fund.kind === 'animal' ? 'paw' : 'piggy-bank-outline'} size={16} color="primary" />
          <Text variant="label-md" tone="primary">
            Fondo vecinal
          </Text>
        </View>
        {when ? (
          <Text variant="label-md" tone="muted">
            {when}
          </Text>
        ) : null}
      </View>
      <Text variant="body-lg-bold">{fund.title}</Text>
      {p.pct != null ? <FundProgressBar pct={p.pct} label={amount} /> : null}
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <Text variant="label-md">{amount}</Text>
        <Text variant="label-md" tone="muted">
          {p.contributors} vecinos
        </Text>
      </View>
      {fund.isDemo ? <DemoTag /> : null}
    </PressableScale>
  );
}
