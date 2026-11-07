import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { Badge, Button, Card, DemoTag, Icon, Screen, SegmentedControl, Text } from '@/shared/ui';

import { OfferCard } from './components/OfferCard';
import { getDemoResources } from './demoResources';
import { useEmergencyStore } from './store';

type Tab = 'need' | 'resource';

/** Necesidades y recursos del sector: datos de demo + ofertas locales propias. */
export function ResourcesScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const offers = useEmergencyStore((s) => s.offers);
  const [tab, setTab] = useState<Tab>('need');
  const items = getDemoResources(sector.name).filter((item) => item.kind === tab);

  return (
    <Screen safeBottom>
      <SegmentedControl
        accessibilityLabel="Ver necesidades o recursos"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'need', label: 'Necesidades', icon: 'hand-extended-outline' },
          { value: 'resource', label: 'Recursos', icon: 'package-variant' },
        ]}
      />

      <Text tone="muted">
        {tab === 'need' ? 'Lo que falta' : 'Lo que hay disponible'} en {sector.name}. Las tarjetas de demo
        son ficticias.
      </Text>

      {items.map((item) => (
        <Card key={item.id}>
          <View className="flex-row items-center gap-2">
            <Icon name={item.icon} size={22} color={tab === 'need' ? 'secondary' : 'primary'} />
            <Text variant="body-lg-bold" className="flex-1">
              {item.title}
            </Text>
          </View>
          <Text tone="muted">{item.detail}</Text>
          <View className="flex-row flex-wrap gap-2">
            <Badge label={item.stageLabel} tone={tab === 'need' ? 'secondary' : 'primary'} />
            <DemoTag />
          </View>
        </Card>
      ))}

      {tab === 'resource' ? (
        <View className="gap-3">
          <Text variant="overline" tone="muted">
            Mis ofertas
          </Text>
          {offers.length === 0 ? <Text tone="muted">Todavía no ofreciste nada.</Text> : null}
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </View>
      ) : null}

      <Button label="Ofrecer ayuda" icon="hand-heart-outline" onPress={() => router.push('/emergencias/ofrecer')} />
    </Screen>
  );
}
