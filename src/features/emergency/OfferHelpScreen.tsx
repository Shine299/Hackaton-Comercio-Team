import { useState } from 'react';
import { View } from 'react-native';

import { useRegistrationGate } from '@/features/session';
import { Button, Card, Chip, Screen, Text, TextField } from '@/shared/ui';

import { ApproxZoneCard } from './components/FormBits';
import { OfferCard } from './components/OfferCard';
import { useEmergencyStore } from './store';
import { getResourceKind, RESOURCE_KINDS, type ResourceKind } from './types';

const parseQuantity = (text: string) => {
  const n = Number.parseInt(text, 10);
  return Number.isInteger(n) && n >= 1 && n <= 100000 ? n : undefined;
};

/** «Ofrecer ayuda»: publicar una oferta pide nombre público (registro simulado). */
export function OfferHelpScreen() {
  const { requireRegistration, sheet } = useRegistrationGate();
  const offers = useEmergencyStore((s) => s.offers);
  const addOffer = useEmergencyStore((s) => s.addOffer);
  const advanceOffer = useEmergencyStore((s) => s.advanceOffer);
  const cancelOffer = useEmergencyStore((s) => s.cancelOffer);
  const registerDelivery = useEmergencyStore((s) => s.registerDelivery);
  const addQuantity = useEmergencyStore((s) => s.addQuantity);
  const findActiveOffer = useEmergencyStore((s) => s.findActiveOffer);
  const [quantityText, setQuantityText] = useState('');
  const [duplicateOf, setDuplicateOf] = useState<string | undefined>();
  const [resource, setResource] = useState<ResourceKind | undefined>();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    if (!resource) {
      setError('Elige qué puedes ofrecer.');
      return;
    }
    requireRegistration('Para ofrecer ayuda, crea tu cuenta vecinal. Solo pedimos un nombre público.', () => {
      const quantity = parseQuantity(quantityText);
      if (quantityText.trim() && !quantity) {
        setError('La cantidad debe ser un número entero de 1 a 100000.');
        return;
      }
      // Nunca se crea una oferta repetida en silencio: la persona decide si suma o crea otra.
      if (findActiveOffer(resource)) {
        setDuplicateOf(resource);
        return;
      }
      create(resource, quantity);
    });
  };

  const create = (kind: ResourceKind, quantity?: number) => {
    addOffer(kind, note, quantity);
    setResource(undefined);
    setNote('');
    setQuantityText('');
    setDuplicateOf(undefined);
  };

  const existing = duplicateOf ? findActiveOffer(duplicateOf as ResourceKind) : undefined;
  const pendingQuantity = parseQuantity(quantityText);

  return (
    <Screen safeBottom>
      <View className="gap-1">
        <Text variant="headline-md">¿Qué puedes ofrecer?</Text>
        <Text tone="muted">Tu oferta queda en tu teléfono hasta que exista conexión con el servidor.</Text>
      </View>

      <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
        {RESOURCE_KINDS.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            icon={item.icon}
            role="radio"
            selected={resource === item.id}
            onPress={() => {
              setResource(item.id);
              setError(undefined);
            }}
          />
        ))}
      </View>
      {error ? (
        <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <TextField
        label="Cantidad o detalle (opcional)"
        placeholder="Ej.: 2 bidones de 20 L, disponible hoy"
        value={note}
        onChangeText={setNote}
      />

      <TextField
        label="Cantidad de unidades (opcional)"
        hint="Con cantidad podrás registrar entregas parciales."
        placeholder="Ej.: 2"
        keyboardType="number-pad"
        value={quantityText}
        onChangeText={(text) => setQuantityText(text.replace(/[^0-9]/g, ''))}
      />

      <ApproxZoneCard />

      {existing && duplicateOf ? (
        <Card tone="warning" accessibilityLiveRegion="polite">
          <Text variant="body-lg-bold">Ya ofreces {getResourceKind(duplicateOf).label.toLowerCase()} en {existing.sectorName}</Text>
          <Text>
            Para no repetir la oferta, puedes sumar a la existente o crear otra aparte.
          </Text>
          {pendingQuantity ? (
            <Button
              label={`Sumar ${pendingQuantity} a la oferta existente`}
              variant="tonal"
              icon="plus"
              onPress={() => {
                addQuantity(existing.id, pendingQuantity);
                setResource(undefined);
                setNote('');
                setQuantityText('');
                setDuplicateOf(undefined);
              }}
            />
          ) : null}
          <Button label="Crear otra oferta igualmente" variant="outline" icon="content-copy" onPress={() => create(duplicateOf as ResourceKind, pendingQuantity)} />
          <Button label="No crear nada" variant="ghost" onPress={() => setDuplicateOf(undefined)} />
        </Card>
      ) : null}

      <Button label="Guardar oferta" size="lg" icon="hand-heart-outline" onPress={submit} />

      {offers.length > 0 ? (
        <View className="gap-3">
          <Text variant="overline" tone="muted">
            Mis ofertas
          </Text>
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onAdvance={() => advanceOffer(offer.id)}
              onCancel={() => cancelOffer(offer.id)}
              onDeliver={(units) => registerDelivery(offer.id, units)}
            />
          ))}
        </View>
      ) : null}

      {sheet}
    </Screen>
  );
}
